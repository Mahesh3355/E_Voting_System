// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VotingSystem is Ownable, ReentrancyGuard {
    // Emergency stop functionality
    bool public paused = false;
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit EmergencyStop(paused);
    }

    // Batch voting function
    function batchVote(VoteInput[] calldata votes) 
        external 
        onlyRegisteredVoter 
        nonReentrant 
        whenNotPaused 
    {
        require(votes.length > 0 && votes.length <= 5, "Invalid batch size");
        
        for (uint i = 0; i < votes.length; i++) {
            VoteInput memory v = votes[i];
            require(elections[v.electionId].isActive, "Election not active");
            require(uint32(block.timestamp) >= elections[v.electionId].startTime, "Election not started");
            require(uint32(block.timestamp) <= elections[v.electionId].endTime, "Election ended");
            require(candidates[v.electionId][v.candidateId].id != 0, "Candidate does not exist");
            require(candidates[v.electionId][v.candidateId].isActive, "Candidate not active");
            require(!hasVotedForPosition[v.electionId][msg.sender][v.position], "Already voted for position");
            
            hasVotedForPosition[v.electionId][msg.sender][v.position] = true;
            candidates[v.electionId][v.candidateId].voteCount++;
            elections[v.electionId].totalVotes++;
            voters[msg.sender].votedForPosition[v.position] = v.candidateId;
            
            emit VoteCast(v.electionId, msg.sender, v.candidateId, v.position);
        }
        
        emit BatchVotesCast(msg.sender, votes[0].electionId, votes.length);
    }

    // Backup election data
    function backupElectionData(uint256 _electionId) external onlyOwner electionExists(_electionId) {
        Election storage election = elections[_electionId];
        bytes32 backupHash = keccak256(abi.encodePacked(
            election.id,
            election.name,
            election.description,
            election.startTime,
            election.endTime,
            election.totalVotes,
            election.isActive,
            election.isCompleted
        ));
        
        emit ElectionBackupCreated(_electionId, backupHash);
    }
    
    // Batch voting functionality
    struct VoteInput {
        uint256 electionId;
        uint256 candidateId;
        string position;
    }

    // Hardcoded positions
    string[] public PREDEFINED_POSITIONS;

    // Packed structs for gas efficiency
    struct Candidate {
        uint256 id; // 7-digit unique id
        string fullName;
        string position;
        uint256 voteCount; // Using uint256 to prevent potential overflow
        bool isActive;
        uint32 registrationTime; // Reduced from uint256 to uint32
        bytes32 voteHash; // SHA256 hash of candidate data for verification
    }

    struct Voter {
        bool isRegistered;
        mapping(string => uint256) votedForPosition; // position => candidateId
        uint32 registrationTime; // Reduced from uint256 to uint32
        bytes32 voterHash; // SHA256 hash of voter data for verification
    }

    struct Election {
        uint256 id;
        string name;
        string description;
        uint32 startTime; // Reduced from uint256 to uint32
        uint32 endTime; // Reduced from uint256 to uint32
        bool isActive;
        bool isCompleted;
        uint256 totalVotes; // Changed back to uint256 for large vote counts
        mapping(string => uint8) totalCandidatesPerPosition; // Reduced to uint8 (max 255 candidates per position)
        bytes32 electionHash; // SHA256 hash of election data for verification
    }

    struct PositionResult {
        string position;
        string[] winnerNames;
        uint256 winningVoteCount; // Using uint256 to prevent potential overflow
        bool isTied;
        bytes32 resultHash; // SHA256 hash of result data for verification
    }

    // State variables
    uint256 private _electionIds = 0;
    
    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates; // electionId => candidateId => Candidate
    mapping(uint256 => mapping(string => uint256[])) public candidatesByPosition; // electionId => position => candidateIds[]
    mapping(address => Voter) public voters;
    mapping(uint256 => mapping(address => mapping(string => bool))) public hasVotedForPosition; // electionId => voter => position => hasVoted
    
    // Packed fees for gas efficiency
    uint96 public registrationFee = 0.01 ether; // Reduced from uint256 to uint96
    uint96 public candidateRegistrationFee = 0.005 ether; // Lowered for testing
    
    // Events
    event ElectionCreated(uint256 indexed electionId, string name, uint32 startTime, uint32 endTime, bytes32 electionHash);
    event CandidateRegistered(uint256 indexed electionId, uint256 indexed candidateId, string fullName, string position, bytes32 voteHash);
    event VoterRegistered(address indexed voter, uint32 registrationTime, bytes32 voterHash);
    event VoteCast(uint256 indexed electionId, address indexed voter, uint256 indexed candidateId, string position);
    event ElectionCompleted(uint256 indexed electionId, uint256 totalVotes);
    event FeesUpdated(uint96 newRegistrationFee, uint96 newCandidateFee);
    event ElectionDataReset(uint256 indexed electionId);
    event ElectionBackupCreated(uint256 indexed electionId, bytes32 backupHash);
    event BatchVotesCast(address indexed voter, uint256 indexed electionId, uint256 votesCount);
    event EmergencyStop(bool paused);
    event FeesWithdrawn(address indexed owner, uint256 amount);

    // Modifiers
    modifier onlyRegisteredVoter() {
        require(voters[msg.sender].isRegistered, "Voter not registered");
        _;
    }

    modifier electionExists(uint256 _electionId) {
        require(_electionId > 0 && _electionId <= _electionIds, "Election does not exist");
        _;
    }

    modifier electionActive(uint256 _electionId) {
        require(elections[_electionId].isActive, "Election is not active");
        require(uint32(block.timestamp) >= elections[_electionId].startTime, "Election has not started");
        require(uint32(block.timestamp) <= elections[_electionId].endTime, "Election has ended");
        _;
    }

    modifier candidateExists(uint256 _electionId, uint256 _candidateId) {
        require(_candidateId > 0 && candidates[_electionId][_candidateId].id != 0, "Candidate does not exist");
        require(candidates[_electionId][_candidateId].isActive, "Candidate is not active");
        _;
    }

    modifier validPosition(string memory _position) {
        bool isValid = false;
        for (uint256 i = 0; i < PREDEFINED_POSITIONS.length; i++) {
            if (keccak256(bytes(PREDEFINED_POSITIONS[i])) == keccak256(bytes(_position))) {
                isValid = true;
                break;
            }
        }
        require(isValid, "Invalid position. Only predefined positions are allowed");
        _;
    }

    // Constructor
    constructor() Ownable(msg.sender) {
        // Initialize IDs to start from 1
        _electionIds = 1;
        
        // Initialize predefined positions
        PREDEFINED_POSITIONS.push("Vice-president");
        PREDEFINED_POSITIONS.push("GS(GYMKHANA)");
        PREDEFINED_POSITIONS.push("GS(CULTURAL)");
        PREDEFINED_POSITIONS.push("GS(SPORTS)");
        PREDEFINED_POSITIONS.push("GS(TECHNICAL)");
    }

    // Helper function to generate SHA256 hash
    function generateHash(string memory data) internal pure returns (bytes32) {
        return sha256(bytes(data));
    }

    // Helper function to generate candidate hash
    function generateCandidateHash(uint256 _candidateId, string memory _fullName, string memory _position, uint32 _registrationTime) internal pure returns (bytes32) {
        string memory candidateData = string(abi.encodePacked(
            _candidateId,
            _fullName,
            _position,
            _registrationTime
        ));
        return sha256(bytes(candidateData));
    }

    // Helper function to generate voter hash
    function generateVoterHash(address _voter, uint32 _registrationTime) internal pure returns (bytes32) {
        string memory voterData = string(abi.encodePacked(
            _voter,
            _registrationTime
        ));
        return sha256(bytes(voterData));
    }

    // Helper function to generate election hash
    function generateElectionHash(uint256 _electionId, string memory _name, string memory _description, uint32 _startTime, uint32 _endTime) internal pure returns (bytes32) {
        string memory electionData = string(abi.encodePacked(
            _electionId,
            _name,
            _description,
            _startTime,
            _endTime
        ));
        return sha256(bytes(electionData));
    }

    // Admin functions
    function createElection(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        
        // Auto-reset previous election data if it exists and is completed
        if (_electionIds > 1) {
            uint256 previousElectionId = _electionIds - 1;
            if (elections[previousElectionId].isCompleted) {
                _resetElectionData(previousElectionId);
            }
        }
        
        uint256 electionId = _electionIds;
        Election storage election = elections[electionId];
        election.id = electionId;
        election.name = _name;
        election.description = _description;
        election.startTime = uint32(_startTime);
        election.endTime = uint32(_endTime);
        election.isActive = true;
        election.isCompleted = false;
        election.totalVotes = 0;
        election.electionHash = generateElectionHash(electionId, _name, _description, uint32(_startTime), uint32(_endTime));
        
        _electionIds++;
        emit ElectionCreated(electionId, _name, uint32(_startTime), uint32(_endTime), election.electionHash);
    }

    // Internal function to reset election data
    function _resetElectionData(uint256 _electionId) internal {
        // Reset candidate vote counts and deactivate them
        for (uint256 i = 0; i < PREDEFINED_POSITIONS.length; i++) {
            string memory position = PREDEFINED_POSITIONS[i];
            uint256[] memory candidateIds = candidatesByPosition[_electionId][position];
            
            for (uint256 j = 0; j < candidateIds.length; j++) {
                if (candidates[_electionId][candidateIds[j]].isActive) {
                    candidates[_electionId][candidateIds[j]].voteCount = 0;
                    candidates[_electionId][candidateIds[j]].isActive = false;
                }
            }
        }
        
        // Reset election data
        elections[_electionId].totalVotes = 0;
        elections[_electionId].isCompleted = false;
        
        emit ElectionDataReset(_electionId);
    }

    // Function to reset election data after results are published (manual override)
    function resetElectionData(uint256 _electionId) external onlyOwner electionExists(_electionId) {
        require(elections[_electionId].isCompleted, "Election must be completed before reset");
        require(!elections[_electionId].isActive, "Election must not be active");
        
        _resetElectionData(_electionId);
    }

    // Function to prepare for next election cycle (auto-resets previous data)
    function prepareNextElection(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        
        // Auto-reset previous election data if it exists and is completed
        if (_electionIds > 1) {
            uint256 previousElectionId = _electionIds - 1;
            if (elections[previousElectionId].isCompleted) {
                _resetElectionData(previousElectionId);
            }
        }
        
        uint256 electionId = _electionIds;
        Election storage election = elections[electionId];
        election.id = electionId;
        election.name = _name;
        election.description = _description;
        election.startTime = uint32(_startTime);
        election.endTime = uint32(_endTime);
        election.isActive = true;
        election.isCompleted = false;
        election.totalVotes = 0;
        election.electionHash = generateElectionHash(electionId, _name, _description, uint32(_startTime), uint32(_endTime));
        
        _electionIds++;
        emit ElectionCreated(electionId, _name, uint32(_startTime), uint32(_endTime), election.electionHash);
    }

    function registerCandidate(
        uint256 _electionId,
        string memory _fullName,
        string memory _position,
        uint256 _candidateId
    ) external payable electionExists(_electionId) validPosition(_position) whenNotPaused {
        require(msg.value >= candidateRegistrationFee, "Insufficient registration fee");
        require(bytes(_fullName).length > 0, "Full name cannot be empty");
        require(_candidateId >= 1000000 && _candidateId <= 9999999, "Candidate ID must be 7 digits");
        
        // Ensure candidateId is unique for this election
        require(candidates[_electionId][_candidateId].id == 0, "Candidate ID already registered");
        
        uint32 registrationTime = uint32(block.timestamp);
        bytes32 voteHash = generateCandidateHash(_candidateId, _fullName, _position, registrationTime);
        
        candidates[_electionId][_candidateId] = Candidate({
            id: _candidateId,
            fullName: _fullName,
            position: _position,
            voteCount: 0,
            isActive: true,
            registrationTime: registrationTime,
            voteHash: voteHash
        });
        
        // Add candidate to position mapping
        candidatesByPosition[_electionId][_position].push(_candidateId);
        elections[_electionId].totalCandidatesPerPosition[_position]++;
        
        emit CandidateRegistered(_electionId, _candidateId, _fullName, _position, voteHash);
    }

    function updateFees(uint96 _registrationFee, uint96 _candidateFee) external onlyOwner {
        registrationFee = _registrationFee;
        candidateRegistrationFee = _candidateFee;
        emit FeesUpdated(_registrationFee, _candidateFee);
    }

    function completeElection(uint256 _electionId) external onlyOwner electionExists(_electionId) {
        require(uint32(block.timestamp) > elections[_electionId].endTime, "Election has not ended yet");
        require(!elections[_electionId].isCompleted, "Election already completed");
        
        elections[_electionId].isActive = false;
        elections[_electionId].isCompleted = true;
        
        emit ElectionCompleted(_electionId, elections[_electionId].totalVotes);
    }

    // Function to clear voter's voting history for a specific election
    function clearVoterVotingHistory(uint256 _electionId, address _voter) external onlyOwner {
        require(elections[_electionId].isCompleted, "Election must be completed");
        
        for (uint256 i = 0; i < PREDEFINED_POSITIONS.length; i++) {
            string memory position = PREDEFINED_POSITIONS[i];
            hasVotedForPosition[_electionId][_voter][position] = false;
            voters[_voter].votedForPosition[position] = 0;
        }
    }

    // Voter functions - Optimized for low gas
    function registerVoter() external payable whenNotPaused {
        require(!voters[msg.sender].isRegistered, "Already registered");
        require(msg.value >= registrationFee, "Insufficient registration fee");
        
        uint32 registrationTime = uint32(block.timestamp);
        bytes32 voterHash = generateVoterHash(msg.sender, registrationTime);
        
        voters[msg.sender].isRegistered = true;
        voters[msg.sender].registrationTime = registrationTime;
        voters[msg.sender].voterHash = voterHash;
        
        emit VoterRegistered(msg.sender, registrationTime, voterHash);
    }

    // Optimized vote function for minimal gas consumption
    function vote(uint256 _electionId, uint256 _candidateId) 
        external 
        onlyRegisteredVoter 
        electionExists(_electionId) 
        electionActive(_electionId) 
        candidateExists(_electionId, _candidateId) 
        nonReentrant
        whenNotPaused 
    {
        string memory position = candidates[_electionId][_candidateId].position;
        require(!hasVotedForPosition[_electionId][msg.sender][position], "Already voted for this position");
        
        // Update state in single operation to save gas
        hasVotedForPosition[_electionId][msg.sender][position] = true;
        candidates[_electionId][_candidateId].voteCount++;
        elections[_electionId].totalVotes++;
        voters[msg.sender].votedForPosition[position] = _candidateId;
        
        emit VoteCast(_electionId, msg.sender, _candidateId, position);
    }

    // View functions
    function getElection(uint256 _electionId) external view electionExists(_electionId) returns (
        uint256 id,
        string memory name,
        string memory description,
        uint32 startTime,
        uint32 endTime,
        bool isActive,
        bool isCompleted,
        uint256 totalVotes,
        bytes32 electionHash
    ) {
        Election storage election = elections[_electionId];
        return (
            election.id,
            election.name,
            election.description,
            election.startTime,
            election.endTime,
            election.isActive,
            election.isCompleted,
            election.totalVotes,
            election.electionHash
        );
    }

    /// @notice Retrieves candidate information
    /// @dev Returns all candidate details including vote count as uint256
    /// @param _electionId The ID of the election
    /// @param _candidateId The ID of the candidate
    /// @return id Candidate's unique identifier
    /// @return fullName Candidate's full name
    /// @return position Position being contested
    /// @return voteCount Number of votes received (uint256 for large elections)
    /// @return isActive Whether the candidate is active
    /// @return registrationTime Time of registration
    /// @return voteHash Hash of candidate data
    function getCandidate(uint256 _electionId, uint256 _candidateId) 
        external 
        view 
        electionExists(_electionId) 
        returns (
            uint256 id,
            string memory fullName,
            string memory position,
            uint256 voteCount,
            bool isActive,
            uint32 registrationTime,
            bytes32 voteHash
        ) 
    {
        require(_candidateId > 0 && candidates[_electionId][_candidateId].id != 0, "Candidate does not exist");
        Candidate storage c = candidates[_electionId][_candidateId];
        return (
            c.id,
            c.fullName,
            c.position,
            c.voteCount,
            c.isActive,
            c.registrationTime,
            c.voteHash
        );
    }

    function getVoter(address _voter) external view returns (
        bool isRegistered,
        uint32 registrationTime,
        bytes32 voterHash
    ) {
        Voter storage voter = voters[_voter];
        return (
            voter.isRegistered,
            voter.registrationTime,
            voter.voterHash
        );
    }

    function getCandidatesByPosition(uint256 _electionId, string memory _position) 
        external 
        view 
        electionExists(_electionId) 
        validPosition(_position)
        returns (Candidate[] memory) 
    {
        uint256[] memory candidateIds = candidatesByPosition[_electionId][_position];
        Candidate[] memory positionCandidates = new Candidate[](candidateIds.length);
        
        for (uint256 i = 0; i < candidateIds.length; i++) {
            if (candidates[_electionId][candidateIds[i]].isActive) {
                positionCandidates[i] = candidates[_electionId][candidateIds[i]];
            }
        }
        
        return positionCandidates;
    }

    /// @notice Calculates winners for a given position in an election
    /// @dev Uses a single pass algorithm to find winners and handles ties
    /// @param _electionId The ID of the election
    /// @param position The position to calculate winners for
    /// @return winnerNames Array of winner names
    /// @return winningVoteCount The highest vote count
    /// @return isTied Whether there is a tie
    /// @return resultHash Hash of the result data
    function _calculateWinners(uint256 _electionId, string memory position) private view returns (
        string[] memory winnerNames,
        uint256 winningVoteCount,
        bool isTied,
        bytes32 resultHash
    ) {
        uint256[] memory candidateIds = candidatesByPosition[_electionId][position];
        if (candidateIds.length == 0) {
            string[] memory emptyWinners = new string[](1);
            emptyWinners[0] = "No Votes";
            return (emptyWinners, 0, false, bytes32(0));
        }
        uint256 maxVotes = 0;
        uint256 winnerCount = 0;
        for (uint256 i = 0; i < candidateIds.length; i++) {
            if (candidates[_electionId][candidateIds[i]].isActive) {
                uint256 currentVotes = candidates[_electionId][candidateIds[i]].voteCount;
                if (currentVotes > maxVotes) {
                    maxVotes = currentVotes;
                    winnerCount = 1;
                } else if (currentVotes == maxVotes) {
                    winnerCount++;
                }
            }
        }
        require(winnerCount > 0, "No active candidates found");
        string[] memory tempWinnerNames = new string[](winnerCount);
        uint256 winnerIndex = 0;
        for (uint256 i = 0; i < candidateIds.length && winnerIndex < winnerCount; i++) {
            if (candidates[_electionId][candidateIds[i]].isActive && 
                candidates[_electionId][candidateIds[i]].voteCount == maxVotes) {
                tempWinnerNames[winnerIndex] = candidates[_electionId][candidateIds[i]].fullName;
                winnerIndex++;
            }
        }
        winnerNames = tempWinnerNames;
        winningVoteCount = maxVotes;
        isTied = winnerCount > 1;
        bytes memory encodedData = abi.encodePacked(position, maxVotes, winnerCount);
        for (uint256 i = 0; i < winnerCount; i++) {
            encodedData = abi.encodePacked(encodedData, keccak256(bytes(tempWinnerNames[i])));
        }
        resultHash = keccak256(encodedData);
    }

    // Enhanced getElectionResults function that properly shows maximum vote candidates for each position
    /// @notice Retrieves complete election results for all positions
    /// @dev Returns arrays of results for each predefined position
    /// @param _electionId The ID of the election to get results for
    /// @return positions Array of position names
    /// @return winnerNames Array of arrays containing winner names for each position
    /// @return winningVoteCounts Array of winning vote counts (uint256 for large elections)
    /// @return isTied Array of boolean flags indicating ties
    /// @return resultHashes Array of result verification hashes
    function getElectionResults(uint256 _electionId) 
        external 
        view 
        electionExists(_electionId) 
        returns (
            string[] memory positions,
            string[][] memory winnerNames,
            uint256[] memory winningVoteCounts,
            bool[] memory isTied,
            bytes32[] memory resultHashes
        ) 
    {
        require(elections[_electionId].isCompleted, "Election not completed yet");
        uint256 len = PREDEFINED_POSITIONS.length;
        positions = new string[](len);
        winnerNames = new string[][](len);
        winningVoteCounts = new uint256[](len);
        isTied = new bool[](len);
        resultHashes = new bytes32[](len);
        bool hasAnyCandidates = false;
        for (uint256 i = 0; i < len; i++) {
            string memory position = PREDEFINED_POSITIONS[i];
            positions[i] = position;
            if (candidatesByPosition[_electionId][position].length > 0) {
                hasAnyCandidates = true;
            }
            (winnerNames[i], winningVoteCounts[i], isTied[i], resultHashes[i]) = _calculateWinners(_electionId, position);
        }
        if (!hasAnyCandidates) {
            revert("No candidates for this election");
        }
    }

    // Function to get winner for a specific position
    /// @notice Retrieves winner information for a specific position
    /// @dev Returns winner details including vote count as uint256
    /// @param _electionId The ID of the election
    /// @param _position The position to get winner for
    /// @return winnerNames Array of winner names (multiple in case of tie)
    /// @return winningVoteCount Number of votes received by winner(s)
    /// @return isTied Whether there is a tie for the position
    /// @return resultHash Hash of the result data for verification
    function getPositionWinner(uint256 _electionId, string memory _position) 
        external 
        view 
        electionExists(_electionId) 
        validPosition(_position)
        returns (
            string[] memory winnerNames,
            uint256 winningVoteCount,
            bool isTied,
            bytes32 resultHash
        ) 
    {
        require(elections[_electionId].isCompleted, "Election not completed yet");
        return _calculateWinners(_electionId, _position);
    }

    function getActiveElections() external view returns (
        uint256[] memory ids,
        string[] memory names,
        string[] memory descriptions,
        uint32[] memory startTimes,
        uint32[] memory endTimes
    ) {
        uint256 totalElections = _electionIds - 1;
        uint256 activeCount = 0;
        
        // Count active elections
        for (uint256 i = 1; i <= totalElections; i++) {
            if (elections[i].isActive) {
                activeCount++;
            }
        }
        
        ids = new uint256[](activeCount);
        names = new string[](activeCount);
        descriptions = new string[](activeCount);
        startTimes = new uint32[](activeCount);
        endTimes = new uint32[](activeCount);
        
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= totalElections; i++) {
            if (elections[i].isActive) {
                ids[currentIndex] = elections[i].id;
                names[currentIndex] = elections[i].name;
                descriptions[currentIndex] = elections[i].description;
                startTimes[currentIndex] = elections[i].startTime;
                endTimes[currentIndex] = elections[i].endTime;
                currentIndex++;
            }
        }
        
        return (ids, names, descriptions, startTimes, endTimes);
    }

    function getTotalElections() external view returns (uint256) {
        return _electionIds - 1;
    }

    function getPredefinedPositions() external view returns (string[] memory) {
        return PREDEFINED_POSITIONS;
    }

    function hasVoterVotedForPosition(uint256 _electionId, address _voter, string memory _position) 
        external 
        view 
        validPosition(_position)
        returns (bool) 
    {
        return hasVotedForPosition[_electionId][_voter][_position];
    }

    function getVoterVoteForPosition(uint256 _electionId, address _voter, string memory _position) 
        external 
        view 
        electionExists(_electionId)
        validPosition(_position)
        returns (uint256) 
    {
        require(voters[_voter].isRegistered, "Voter not registered");
        return voters[_voter].votedForPosition[_position];
    }

    // Withdraw functions
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        // Clear the balance before external call to prevent reentrancy
        uint256 amountToWithdraw = balance;
        
        // External call
        (bool success, ) = payable(owner()).call{value: amountToWithdraw}("");
        require(success, "Withdrawal failed");
        
        emit FeesWithdrawn(owner(), amountToWithdraw);
    }

    // Emergency functions
    function emergencyStopElection(uint256 _electionId) external onlyOwner electionExists(_electionId) {
        elections[_electionId].isActive = false;
    }

    function removeCandidate(uint256 _electionId, uint256 _candidateId) 
        external 
        onlyOwner 
        electionExists(_electionId) 
    {
        require(_candidateId > 0 && candidates[_electionId][_candidateId].id != 0, "Candidate does not exist");
        candidates[_electionId][_candidateId].isActive = false;
    }

    // Function to bulk clear voter voting history for multiple voters
    function bulkClearVoterVotingHistory(uint256 _electionId, address[] memory _voters) external onlyOwner {
        require(elections[_electionId].isCompleted, "Election must be completed");
        
        for (uint256 v = 0; v < _voters.length; v++) {
            address voter = _voters[v];
            for (uint256 i = 0; i < PREDEFINED_POSITIONS.length; i++) {
                string memory position = PREDEFINED_POSITIONS[i];
                hasVotedForPosition[_electionId][voter][position] = false;
                voters[voter].votedForPosition[position] = 0;
            }
        }
    }
    // This is a duplicate function and should be removed as it's already defined above

}