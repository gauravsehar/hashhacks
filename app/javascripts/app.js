import "../stylesheets/app.css";

import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

import myWallet_artifact from '../../build/contracts/MyWallet.json'

var MyWallet = contract(myWallet_artifact);

var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    MyWallet.setProvider(web3.currentProvider);

    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

     // document.getElementById("addresses").innerHTML = accounts.join("<br />");

      App.basicInfoUpdate();
      App.listenToEvents();
    });
  },

  basicInfoUpdate: function() {
    MyWallet.deployed().then(function(instance) {
      document.getElementById("walletAddress").innerHTML = instance.address;
      document.getElementById("walletEther").innerHTML = web3.fromWei(web3.eth.getBalance(instance.address).toNumber(), "ether");
    })
  },

  listenToEvents: function() {
    MyWallet.deployed().then(function(instance) {
      instance.receivedFunds({},{fromBlock:0, toBlock:'latest'}).watch(function(error, event) {
        document.getElementById("fundEvents").innerHTML += JSON.stringify(event);
      });
      instance.proposalReceived({},{fromBlock:0, toBlock:'latest'}).watch(function(error, event) {
        document.getElementById("proposalEvents").innerHTML += JSON.stringify(event);
      });
    });
  },

  confirmTransaction: function() {
    //YOUR PART
  },

  submitEtherToWallet: function() {
    MyWallet.deployed().then(function(instance) {

      return instance.sendTransaction({from: account, to: instance.address, value: web3.toWei(5, "ether")});

    }).then(function(result) {
      App.basicInfoUpdate();
    });
  },

  submitTransaction: function() {
    var _to = document.getElementById("to").value;
    var _amount = parseInt(document.getElementById("amount").value);
    var _reason = document.getElementById("reason").value;

    MyWallet.deployed().then(function(instance) {
      return instance.spendMoneyOn(_to, web3.toWei(_amount, 'finney'), _reason, {from:accounts[2], gas:500000});
    }).then(function(result) {
      console.log(result);
      App.basicInfoUpdate();
    }).catch(function(err) {
      console.error(err);
    });
  },

  sendCoin: function() {
    var self = this;
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
