'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import blockchainService, { Election, Candidate, ElectionResults } from '@/services/blockchain';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface BlockchainVotingProps {
  userEmail?: string;
}

const BlockchainVoting: React.FC<BlockchainVotingProps> = ({ userEmail }) => {
  const { isConnected, connectWallet, walletAddress } = useWeb3();
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [positions, setPositions] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load active elections
      const activeElections = await blockchainService.getActiveElections();
      setElections(activeElections);

      // Load predefined positions
      const predefinedPositions = await blockchainService.getPredefinedPositions();
      setPositions(predefinedPositions);

      // Load approved candidates
      const approvedCandidates = await blockchainService.getApprovedCandidates();
      setCandidates(approvedCandidates);

    } catch (error) {
      setError('Failed to load voting data');
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleElectionSelect = (election: Election) => {
    setSelectedElection(election);
    setSelectedCandidate(null);
    setResults(null);
  };

  const handleCandidateSelect = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleVote = async () => {
    if (!userEmail || !selectedElection || !selectedCandidate) {
      setError('Please select an election and candidate');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const result = await blockchainService.castVote(
        userEmail,
        selectedCandidate.id,
        selectedElection.id
      );

      if (result.success) {
        setSuccess('Vote cast successfully! Transaction hash: ' + result.transactionHash);
        setSelectedCandidate(null);
        // Reload candidates to update vote counts
        await loadData();
      } else {
        setError(result.message || 'Failed to cast vote');
      }
    } catch (error) {
      setError('Failed to cast vote. Please try again.');
      console.error('Error casting vote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewResults = async () => {
    if (!selectedElection) return;

    try {
      setIsLoading(true);
      setError(null);

      const electionResults = await blockchainService.getElectionResults(selectedElection.id);
      setResults(electionResults);
    } catch (error) {
      setError('Failed to load election results');
      console.error('Error loading results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getElectionPhase = (election: Election) => {
    return blockchainService.getElectionPhase(election);
  };

  const formatDate = (timestamp: number) => {
    return blockchainService.formatTimestamp(timestamp);
  };

  if (isLoading && elections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading voting data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Blockchain Voting</h1>
        <p className="text-gray-600">Cast your vote securely on the blockchain</p>
      </div>

      {/* Wallet Connection */}
      {!isConnected && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-yellow-800 mb-4">
                Connect your wallet to participate in blockchain voting
              </p>
              <Button onClick={connectWallet} className="bg-yellow-600 hover:bg-yellow-700">
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error/Success Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-green-800">{success}</p>
          </CardContent>
        </Card>
      )}

      {/* Active Elections */}
      <div className="grid gap-6">
        <h2 className="text-2xl font-semibold text-gray-900">Active Elections</h2>
        
        {elections.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">No active elections available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {elections.map((election) => {
              const phase = getElectionPhase(election);
              const isActive = blockchainService.isElectionActive(election);
              
              return (
                <Card 
                  key={election.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedElection?.id === election.id ? 'ring-2 ring-red-500' : ''
                  }`}
                  onClick={() => handleElectionSelect(election)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{election.name}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        phase === 'voting' ? 'bg-green-100 text-green-800' :
                        phase === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {phase.charAt(0).toUpperCase() + phase.slice(1)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{election.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Start:</span> {formatDate(election.startTime)}
                      </div>
                      <div>
                        <span className="font-medium">End:</span> {formatDate(election.endTime)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Voting Interface */}
      {selectedElection && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Vote for: {selectedElection.name}
            </h3>
            <Button 
              onClick={handleViewResults}
              variant="outline"
              disabled={isLoading}
            >
              View Results
            </Button>
          </div>

          {/* Results Display */}
          {results && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900">Election Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.positions.map((position, index) => (
                    <div key={position} className="border-b border-blue-200 pb-4 last:border-b-0">
                      <h4 className="font-medium text-blue-900 mb-2">{position}</h4>
                      <div className="space-y-2">
                        <p className="text-blue-800">
                          Winner: {results.winnerNames[index]}
                        </p>
                        <p className="text-blue-700">
                          Votes: {results.winningVoteCounts[index]}
                        </p>
                        {results.isTied[index] && (
                          <p className="text-orange-600 font-medium">⚠️ Tie detected</p>
                        )}
                        <p className="text-xs text-blue-600">
                          Hash: {results.resultHashes[index]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Candidates by Position */}
          {positions.map((position) => {
            const positionCandidates = candidates.filter(c => c.position === position);
            
            return (
              <Card key={position}>
                <CardHeader>
                  <CardTitle>{position}</CardTitle>
                </CardHeader>
                <CardContent>
                  {positionCandidates.length === 0 ? (
                    <p className="text-gray-600">No candidates for this position</p>
                  ) : (
                    <div className="grid gap-4">
                      {positionCandidates.map((candidate) => (
                        <Card 
                          key={candidate.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedCandidate?.id === candidate.id ? 'ring-2 ring-red-500' : ''
                          }`}
                          onClick={() => handleCandidateSelect(candidate)}
                        >
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{candidate.name}</h4>
                                <p className="text-sm text-gray-600">
                                  Votes: {candidate.voteCount}
                                </p>
                                {candidate.isBlockchainRegistered && (
                                  <p className="text-xs text-green-600">
                                    ✓ Registered on blockchain
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {selectedCandidate?.id === candidate.id && (
                                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                )}
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCandidateSelect(candidate);
                                  }}
                                  variant="outline"
                                  size="sm"
                                >
                                  Select
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Vote Button */}
          {selectedCandidate && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-green-800 mb-4">
                    You have selected: <strong>{selectedCandidate.name}</strong> for <strong>{selectedCandidate.position}</strong>
                  </p>
                  <Button
                    onClick={handleVote}
                    disabled={isLoading || !isConnected}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? 'Casting Vote...' : 'Cast Vote'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default BlockchainVoting; 