const Disperse = artifacts.require("Disperse");
const Yeruslav = artifacts.require("Yeruslav");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Disperse", function (accounts) {

  it("mints 10 tokens", async function () {
    const tokenInstance = await Yeruslav.deployed();

    await tokenInstance.mint(accounts[0], 10, { from: accounts[0] });

    const balance = await tokenInstance.balanceOf.call(accounts[0]);
    return assert.equal( balance.valueOf(), 10);
  });

  it("disperse tokens into 2 accounts", async function () {
    const tokenInstance = await Yeruslav.deployed();
    const instance = await Disperse.deployed();

    assert.equal( await tokenInstance.balanceOf.call(accounts[1]).valueOf(), 0);
    assert.equal( await tokenInstance.balanceOf.call(accounts[2]).valueOf(), 0);

    await tokenInstance.increaseAllowance(instance.address, 10, { from: accounts[0] });

    await instance.disperseToken(tokenInstance.address, [accounts[1], accounts[2]], [5, 5], { from: accounts[0] });

    assert.equal( await tokenInstance.balanceOf.call(accounts[0]).valueOf(), 0);
    assert.equal( await tokenInstance.balanceOf.call(accounts[1]).valueOf(), 5);
    assert.equal( await tokenInstance.balanceOf.call(accounts[2]).valueOf(), 5);
  });

  it("disperse ETH into 2 accounts with change", async function () {
    const tokenInstance = await Yeruslav.deployed();
    const instance = await Disperse.deployed();

    // const balance0 = await web3.eth.getBalance(accounts[0]);
    const balance1 = await web3.eth.getBalance(accounts[1]);
    const balance2 = await web3.eth.getBalance(accounts[2]);

    await instance.disperseEther([accounts[1], accounts[2]], ["6", "6"], { from: accounts[0], value: "14" });

    // const _balance0 = await web3.eth.getBalance(accounts[0]);
    const _balance1 = await web3.eth.getBalance(accounts[1]);
    const _balance2 = await web3.eth.getBalance(accounts[2]);

    const delta1 = web3.utils.toBN(_balance1).sub(web3.utils.toBN(balance1)).toNumber();
    const delta2 = web3.utils.toBN(_balance2).sub(web3.utils.toBN(balance2)).toNumber();

    assert.equal( delta1, 6 );
    assert.equal( delta2, 6 );
  });

  it("rejects non whitelist: disperseToken", async function () {
    const tokenInstance = await Yeruslav.deployed();
    const instance = await Disperse.deployed();

    await tokenInstance.mint(accounts[3], 10, { from: accounts[0] });
    await tokenInstance.increaseAllowance(instance.address, 10, { from: accounts[3] });

    try {
      await instance.disperseToken(tokenInstance.address, [accounts[1], accounts[2]], [5, 5], { from: accounts[3] });
      throw null;
    } catch (e) {
      // Error: Returned error: VM Exception while processing transaction: revert B -- Reason given: B.
      assert(e, "Expected reject of type B, did not revert!");
      assert(e.message.indexOf("revert B -- Reason given: B.") != -1, "Expected reject of type B, wrong revert reason: " + e.message);
    }

    assert.equal( await tokenInstance.balanceOf.call(accounts[3]).valueOf(), 10);
  });

  it("rejects non whitelist: disperseEther", async function () {
    const tokenInstance = await Yeruslav.deployed();
    const instance = await Disperse.deployed();

    try {
      await instance.disperseEther([accounts[1], accounts[2]], [5, 5], { from: accounts[3] });
      throw null;
    } catch (e) {
      // Error: Returned error: VM Exception while processing transaction: revert B -- Reason given: B.
      assert(e, "Expected reject of type B, did not revert!");
      assert(e.message.indexOf("revert B -- Reason given: B.") != -1, "Expected reject of type B, wrong revert reason: " + e.message);
    }
  });

  it("allows whitelisted: disperseToken", async function () {
    const tokenInstance = await Yeruslav.deployed();
    const instance = await Disperse.deployed();

    await instance.addUser(accounts[3], { from: accounts[0] });

    assert.equal(await tokenInstance.balanceOf.call(accounts[3]).valueOf(), 10);

    await instance.disperseTokenSimple(tokenInstance.address, [accounts[1], accounts[2]], [5, 5], { from: accounts[3] });

    assert.equal(await tokenInstance.balanceOf.call(accounts[3]).valueOf(), 0);
  });

  it("allows whitelisted: disperseEther", async function () {
    const tokenInstance = await Yeruslav.deployed();
    const instance = await Disperse.deployed();

    await instance.addUser(accounts[3], { from: accounts[0] });

    await instance.disperseEther([accounts[1], accounts[2]], [5, 5], { from: accounts[3], value: "10" });
  });

  it("allows whitelisted: disperseEther 2", async function () {
    const tokenInstance = await Yeruslav.deployed();
    const instance = await Disperse.deployed();

    await instance.disperseEther([accounts[1], accounts[2]], [5, 5], { from: accounts[3], value: "10" });
  });

  it("rejects after remove from whitelist: disperseEther", async function () {
    const tokenInstance = await Yeruslav.deployed();
    const instance = await Disperse.deployed();

    await instance.removeUser(accounts[3], { from: accounts[0] });

    try {
      await instance.disperseEther([accounts[1], accounts[2]], [5, 5], { from: accounts[3], value: "10" });
      throw null;
    } catch (e) {
      // Error: Returned error: VM Exception while processing transaction: revert B -- Reason given: B.
      assert(e, "Expected reject of type B, did not revert!");
      assert(e.message.indexOf("revert B -- Reason given: B.") != -1, "Expected reject of type B, wrong revert reason: " + e.message);
    }
  });


  it("rejects non owner: addUser", async function () {
    const tokenInstance = await Yeruslav.deployed();
    const instance = await Disperse.deployed();

    try {
      await instance.addUser(accounts[3], { from: accounts[3] });
      throw null;
    } catch (e) {
      // Error: Returned error: VM Exception while processing transaction: revert B -- Reason given: B.
      assert(e, "Expected reject of type A, did not revert!");
      assert(e.message.indexOf("revert A -- Reason given: A.") != -1, "Expected reject of type A, wrong revert reason: " + e.message);
    }
  });

});
