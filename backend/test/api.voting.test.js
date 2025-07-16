const request = require("supertest");
const app = require("../index"); // Adjust if your Express app is exported differently

describe("Voting API Edge Cases", () => {
  // Example valid data (replace with actual test data or mocks)
  const validAccount = "0x0000000000000000000000000000000000000001";
  const validCandidateId = 1000001;
  const validElectionId = 1;

  it("should return 400 if electionId is missing", async () => {
    const res = await request(app)
      .post("/api/blockchain/cast-vote")
      .send({ accountAddress: validAccount, candidateId: validCandidateId });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 if candidateId is missing", async () => {
    const res = await request(app)
      .post("/api/blockchain/cast-vote")
      .send({ accountAddress: validAccount, electionId: validElectionId });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 if accountAddress is missing", async () => {
    const res = await request(app)
      .post("/api/blockchain/cast-vote")
      .send({ candidateId: validCandidateId, electionId: validElectionId });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return error for non-existent election", async () => {
    const res = await request(app).post("/api/blockchain/cast-vote").send({
      accountAddress: validAccount,
      candidateId: validCandidateId,
      electionId: 9999,
    });
    expect(res.body.success).toBe(false);
  });

  it("should return error for non-existent candidate", async () => {
    const res = await request(app).post("/api/blockchain/cast-vote").send({
      accountAddress: validAccount,
      candidateId: 9999999,
      electionId: validElectionId,
    });
    expect(res.body.success).toBe(false);
  });

  // Add more tests as needed for double voting, successful vote, etc.
});

describe("Voting API Additional Scenarios", () => {
  // These tests assume you have a way to set up/reset the blockchain state for each test.
  // You may need to use beforeAll/beforeEach hooks to deploy a fresh contract, create elections, candidates, and register accounts.
  // Replace the placeholders with actual setup logic as needed.

  const validAccount = "0x0000000000000000000000000000000000000002";
  const validCandidateId = 1000002;
  const validElectionId = 2;

  it("should successfully cast a vote", async () => {
    // TODO: Ensure validElectionId, validCandidateId, and validAccount are set up and registered
    const res = await request(app).post("/api/blockchain/cast-vote").send({
      accountAddress: validAccount,
      candidateId: validCandidateId,
      electionId: validElectionId,
    });
    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
  });

  it("should prevent double voting", async () => {
    // First vote
    await request(app).post("/api/blockchain/cast-vote").send({
      accountAddress: validAccount,
      candidateId: validCandidateId,
      electionId: validElectionId,
    });
    // Second vote (should fail)
    const res = await request(app).post("/api/blockchain/cast-vote").send({
      accountAddress: validAccount,
      candidateId: validCandidateId,
      electionId: validElectionId,
    });
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already voted|double vote/i);
  });

  it("should not allow voting after election ended", async () => {
    // TODO: End the election on-chain for validElectionId before this test
    const res = await request(app).post("/api/blockchain/cast-vote").send({
      accountAddress: validAccount,
      candidateId: validCandidateId,
      electionId: validElectionId,
    });
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/election.*ended|not active/i);
  });

  it("should not allow voting for an inactive candidate", async () => {
    // TODO: Mark validCandidateId as inactive before this test
    const res = await request(app).post("/api/blockchain/cast-vote").send({
      accountAddress: validAccount,
      candidateId: validCandidateId,
      electionId: validElectionId,
    });
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/inactive candidate|not active/i);
  });

  it("should not allow voting with an unregistered account", async () => {
    const unregisteredAccount = "0x000000000000000000000000000000000000dead";
    const res = await request(app).post("/api/blockchain/cast-vote").send({
      accountAddress: unregisteredAccount,
      candidateId: validCandidateId,
      electionId: validElectionId,
    });
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not registered|unregistered/i);
  });
});
