export async function loadSmartContract(contractABI, address) {
  // @ts-ignore
  return await new window.web3.eth.Contract(
    contractABI,
    address
  );
}