import { run } from "hardhat";
import "@nomiclabs/hardhat-etherscan";

export async function verify(contractAddress:string, args:any[]) {
    console.log("Verifying contract with args....");
    console.log(args)
    try
    {    
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: args
      });
      
      console.log('-------------------------------------------------')
    } 
    catch (e:any) {
      console.error(e.message);
    }
  }