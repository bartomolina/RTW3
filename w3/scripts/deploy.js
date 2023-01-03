const main = async() => {
    try {
        const ChainBattles = await hre.ethers.getContractFactory("ChainBattles");
        const chainBattles = await ChainBattles.deploy();
        await chainBattles.deployed();
        
        console.log("Contract deployed to:", chainBattles.address);

        // Mint
        console.log("Minting");
        await chainBattles.mint();
        console.log("Minted");

        // Verify
        await chainBattles.deployTransaction.wait(5);
        await hre.run("verify:verify", {
            address: chainBattles.address,
        });

        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

main();