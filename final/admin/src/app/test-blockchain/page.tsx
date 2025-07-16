"use client";

import React, { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import blockchainService from "@/services/blockchain";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const TestBlockchainPage = () => {
  const { isConnected, connectWallet, walletAddress, isLoading, error } =
    useWeb3();
  const [positions, setPositions] = useState<string[]>([]);
  const [elections, setElections] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any>({});
  const [isTesting, setIsTesting] = useState(false);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const testBlockchainConnection = async () => {
    setIsTesting(true);
    const results: any = {};

    try {
      // Test 1: Get predefined positions
      try {
        const positionsResult =
          await blockchainService.getPredefinedPositions();
        results.positions = { success: true, data: positionsResult };
        setPositions(positionsResult);
      } catch (error) {
        results.positions = { success: false, error: (error as any).message };
      }

      // Test 2: Get active elections
      try {
        const electionsResult = await blockchainService.getActiveElections();
        results.elections = { success: true, data: electionsResult };
        setElections(electionsResult);
      } catch (error) {
        results.elections = { success: false, error: (error as any).message };
      }

      setTestResults(results);
    } catch (error) {
      console.error("Test failed:", error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a] text-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">
            Blockchain Connection Test
          </h1>
          <p className="text-gray-300">
            Test your blockchain integration and MetaMask connection
          </p>
        </div>

        {/* Wallet Connection */}
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <div className="mb-4">
            <div className="text-white text-xl font-bold">
              MetaMask Connection
            </div>
          </div>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <div className="text-center">
                <p className="text-gray-300 mb-4">
                  Connect your MetaMask wallet to test blockchain functions
                </p>
                <Button
                  onClick={handleConnectWallet}
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect MetaMask
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">
                    Wallet Connected!
                  </span>
                </div>
                <p className="text-green-200 text-sm">
                  Address: {walletAddress}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-semibold">
                    Connection Error
                  </span>
                </div>
                <p className="text-red-200 text-sm mt-1">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blockchain Tests */}
        {isConnected && (
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="mb-4">
              <div className="text-white text-xl font-bold">
                Blockchain Function Tests
              </div>
            </div>
            <CardContent className="space-y-6">
              <Button
                onClick={testBlockchainConnection}
                disabled={isTesting}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Blockchain Functions"
                )}
              </Button>

              {/* Test Results */}
              {Object.keys(testResults).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Test Results:
                  </h3>

                  {/* Positions Test */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-300 mb-2">
                      Predefined Positions
                    </h4>
                    {testResults.positions?.success ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm">
                            Success
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {positions.map((position, index) => (
                            <div
                              key={index}
                              className="bg-blue-500/20 rounded px-2 py-1 text-xs"
                            >
                              {position}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-sm">
                          Failed: {testResults.positions?.error}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Elections Test */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-300 mb-2">
                      Active Elections
                    </h4>
                    {testResults.elections?.success ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm">
                            Success
                          </span>
                        </div>
                        {elections.length > 0 ? (
                          <div className="space-y-2">
                            {elections.map((election, index) => (
                              <div
                                key={index}
                                className="bg-purple-500/20 rounded px-3 py-2"
                              >
                                <div className="font-semibold">
                                  {election.name}
                                </div>
                                <div className="text-sm text-gray-300">
                                  {election.description}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">
                            No active elections found
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-sm">
                          Failed: {testResults.elections?.error}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <div className="mb-4">
            <div className="text-white text-xl font-bold">
              Setup Instructions
            </div>
          </div>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                1. Make sure your local Hardhat node is running:
              </p>
              <code className="bg-gray-800 px-2 py-1 rounded text-green-400">
                npx hardhat node
              </code>

              <p className="text-gray-300 mt-4">2. Deploy your contract:</p>
              <code className="bg-gray-800 px-2 py-1 rounded text-green-400">
                npx hardhat run scripts/deploy.ts --network localhost
              </code>

              <p className="text-gray-300 mt-4">
                3. Configure MetaMask to connect to localhost:8545
              </p>

              <p className="text-gray-300 mt-4">
                4. Import a test account using one of the private keys from the
                Hardhat node output
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestBlockchainPage;
