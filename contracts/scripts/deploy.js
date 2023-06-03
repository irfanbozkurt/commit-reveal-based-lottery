const contracts = ["Lottery"];

async function deploy(contractName) {
	const [deployer] = await ethers.getSigners();

	console.log("Deploying contracts with the account:", deployer.address);
	console.log(
		"Deploying account's balance:",
		(await deployer.getBalance()).toString()
	);

	const contractBeforeDeployment = await ethers.getContractFactory(
		contractName
	);

	const contract = await contractBeforeDeployment.deploy();

	console.log(`Contract ${contractName} deployed at ${contract.address}`);
}

Promise.all(contracts.map(deploy))
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
