import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json"

export default function App() {
  //just a state variable we use to store our user's public wallet address. 
  const [currAccount,setCurrentAccount]= React.useState("")
  const contractAddress = "0x0fCdd24E69c88cF1814c7E38ea7330fc4b2D4173"
  const contractABI = abi.abi

 const checkIfWalletIsConnected = ()=>{
    // first make sure we have access to window.ethereum
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have metamask!")
      return
    } else {
      console.log("We have the ethereum object", ethereum)
    }
    ethereum.request({method: 'eth_accounts'})
    .then(accounts =>{
        // we could have multiple accounts. Check for one. 
        if(accounts.length !==0 ){
          // gran the first account we have access to. 
          const account = accounts[0];
          console.log("Found an authorized account:", account)
          // store the users public wallet address for later!
          setCurrentAccount(account);
        } else {
          console.log("No authorized account found")
        }
      })
  }

  const getAllWaves = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have metamask!")
      return
    } 

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let waves = await waveportalContract.getAllWaves()

    let wavesCleaned = []
    waves.forEach(wave =>{
      wavesCleaned.push({
        address: wave.waver,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message
      })
    })
    console.log("cleaned", wavesCleaned)
    setAllWaves(wavesCleaned)

    waveportalContract.on("NewWave", (from, timestamp, message)=> {
      console.log("NewWave",from, timestamp, message)
      setAllWaves(oldArray=> [...oldArray, {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message
      }])
    })
  }

  const connectWallet = ()=> {
    const {ethereum}= window;
    if (!ethereum) {
      alert("get metamask!")
    }
    ethereum.request({method: 'eth_requestAccounts' })
    .then(accounts => {
      console.log("Connected",accounts[0])
      setCurrentAccount(accounts[0])
    })
    .catch(err => console.log(err))
  } 
  const wave = async ()=> {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const waveportalContract = new ethers.Contract(contractAddress,contractABI,signer);

    let count = await waveportalContract.getTotalWaves()
    console.log("Retreived total wave count...", count.toNumber())

    const waveTxn = await waveportalContract.wave("this is a message", {gasLimit: 300000})
    console.log("Mining...", waveTxn.hash)
    await waveTxn.wait()
    console.log("Mined--",waveTxn.hash)

  }
  const [allWaves, setAllWaves] = React.useState([])
  

// this runs our function when the page loads. 
  // React.useEffect(()=> {
  //   checkIfWalletIsConnected()
  // },[])
  React.useEffect(() => {
  checkIfWalletIsConnected();    
  getAllWaves();
  }, [getAllWaves]);


  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        Ohayo ☀️ 
        </div>

        <div className="bio">
        Come say good morning to me. 
        </div>

        <button className="waveButton" onClick={wave}>
          Say gm
        </button>
        {currAccount ? null: (
          <button className= "waveButton" onClick={connectWallet}>Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index)=> {
          return ( 
            <div style ={{backgroundColor: "OldLace", marginTop:"16px", padding: "8px"}}>
              <div>Adress: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message:{wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
