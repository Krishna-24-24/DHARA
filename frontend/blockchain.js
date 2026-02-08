import { RTWA_ABI } from "./rtwaAbi.js";

// ⚠️ Put your real contract address here
const CONTRACT_ADDRESS = "0x5fdb2315678afecb367f032d93f642f64180aa3";

export async function getContract() {

  if (!window.ethereum) {
    alert("Please install MetaMask first!");
    return;
  }

  // Connect wallet
  await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // Connect to contract
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    RTWA_ABI,
    signer
  );
}