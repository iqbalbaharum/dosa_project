<template>
  <a-layout>
    <a-layout-header>
      <h2>Dosa Workshop</h2></a-layout-header>
    <a-layout-content style="margin-top: 20px;">
    <a-skeleton v-if="isLoading" active/>
      <div v-if="!isLoading">
      <a-row :gutter="[16,16]" type="flex" justify="center">
        <a-col :span="24">
          <div>
            <a-button v-if="!connected" @click="connect" type="primary" size="large">Connect To MetaMask</a-button>
          </div>
        </a-col>
      </a-row>
      <a-row v-if="connected && baseNFTs.length > 0" :gutter="[16,16]">
        <a-col :span="24">
            <h2>Topups</h2>
        </a-col>
        <a-col :span="6" >
          <a-card  title="Bronze Package" :bordered="false">
              
              <p>
                <ul>
                  <li>Attack: 5% increase</li>
                  <li>Defense: 5% increase</li>
                  <li>Growth Rate: 5% increase</li>
                  <li>Income Rate: 5% increase</li>
                </ul>
              </p>
              <a-divider></a-divider>
             
              <a-space style="margin-top: 10px;">
                <a-button @click="topup(10)" style="width: 200px;" type="primary" size="middle" danger>Buy for 10 Dosa</a-button>

              </a-space>
            </a-card>
          </a-col>
          <a-col :span="6" >
            <a-card  title="Silver Package" :bordered="false">
              
              <p>
                <ul>
                  <li>Attack: 15% increase</li>
                  <li>Defense: 15% increase</li>
                  <li>Growth Rate: 15% increase</li>
                  <li>Income Rate: 15% increase</li>
                </ul>
              </p>
              <a-divider></a-divider>
             
              <a-space style="margin-top: 10px;">
                <a-button @click="topup(20)" style="width: 200px;" type="primary" size="middle" danger>Buy for 20 Dosa</a-button>

              </a-space>
            </a-card>
            </a-col>
            <a-col :span="6" >
            <a-card  title="Gold Package" :bordered="false">
              
              <p>
                <ul>
                  <li>Attack: 35% increase</li>
                  <li>Defense: 35% increase</li>
                  <li>Growth Rate: 35% increase</li>
                  <li>Income Rate: 35% increase</li>
                </ul>
              </p>
              <a-divider></a-divider>
             
              <a-space style="margin-top: 10px;">
                <a-button @click="topup(30)" style="width: 200px;" type="primary" size="middle" danger>Buy for 30 Dosa</a-button>

              </a-space>
            </a-card>
        </a-col>
      </a-row>
      <a-row v-if="connected && baseNFTs.length > 0" :gutter="[16,16]">
        <a-col :span="24">
            <h2>My Rockets</h2>
        </a-col>
          <a-col v-for="item in baseNFTs" :key="item.id" :span="6" >
            <a-card  :title="`${item.name ? item.name : 'Rocket '+item.tokenId}`" :bordered="false">
              <p>
                <img v-if="item.img" :src="item.img" />
              </p>
              <p>
                <h3>Level {{ item.data?.metadata?.level?.current }}</h3>
                <h4>Level (Next) {{ item.data?.metadata?.level?.next_level }}</h4>
                <h4>Stats</h4>
                <ul>
                  <li>Point: {{ item.data?.metadata?.token?.available }}</li>
                  <li>Attack: {{ item.data?.metadata?.stats?.attack }}</li>
                  <li>Defense: {{ item.data?.metadata?.stats?.defense }}</li>
                  <li>Growth Rate: {{ item.data?.metadata?.stats?.growth_rate }}</li>
                  <li>Income Rate: {{ item.data?.metadata?.stats?.income_rate }}</li>
                </ul>
              </p>
              <a-divider></a-divider>
             
              <a-space style="margin-top: 10px;">
                <a-button @click="cashout(item)" style="width: 200px;" type="primary" size="middle" danger :disabled="item.data?.metadata?.token?.available < 1">Cash Out</a-button>

              </a-space>
            </a-card>
          </a-col>
        
      </a-row>
      <a-row v-if="connected && slots.length > 0" :gutter="[16,16]" style="margin-top: 20px;">
        <a-col :span="24">
            <h2>Upgrades</h2>
        </a-col>
          <a-col v-for="item in slots" :key="item.id" :span="6" >
            <a-card  :title="`${item.name ? item.name : 'Slot '+item.tokenId}`" :bordered="false">
              <p>
                <img v-if="item.img" :src="item.img" />
              </p>
              
              <a-divider></a-divider>
              <a-space>
                <a-select
                  placeholder="Select your rocket"
                  ref="select"
                  style="width: 200px;"
                  v-model:value="valueSlot[item.id]"
                  :options="options"
                  @change="handleChange('slot', item.id)"
                >
                </a-select>
              </a-space>
              <a-space style="margin-top: 10px;">
                <a-button @click="equip('slot', item)" style="width: 200px;" type="primary" size="middle" danger>Equip</a-button>

              </a-space>
            </a-card>
          </a-col>
        
      </a-row>
      <a-row v-if="connected && consumables.length > 0" :gutter="[16,16]" style="margin-top: 20px;">
        <a-col :span="24">
            <h2>Items</h2>
        </a-col>
          <a-col v-for="item in consumables" :key="item.id" :span="6">
            <a-card  :title="`${item.name ? item.name : 'Slot '+item.tokenId}`" :bordered="false">
              <p><img v-if="item.img" :src="item.img" /></p>
              <p>Balance: {{item.balance}}</p>
              <a-divider></a-divider>
              <a-space>
                <a-select
                  placeholder="Select your rocket"
                  ref="select"
                  style="width: 200px;"
                  v-model:value="valueConsumables[item.id]"
                  :options="options"
                  @change="handleChange('consumables', item.id)"
                >
                </a-select>
              </a-space>
              <a-space style="margin-top: 10px;">
                <a-button @click="equip('consumables', item)" style="width: 200px;" type="primary" size="middle" danger :disabled="item.balance < 1">Equip</a-button>

              </a-space>
            </a-card>
          </a-col>
        
      </a-row>
      </div>
    </a-layout-content>
    <a-layout-footer></a-layout-footer>
  </a-layout>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import Web3 from 'web3';
import axios from 'axios';
import slotNFTAbi from './abis/DosaSlotNFT.json';
import baseNFTAbi from './abis/Dosa2NFT.json';
import consumablesNFTAbi from './abis/DosaConsumablesNFT.json';
import mergeNFTAbi from './abis/DosaMergeNFT.json';
import mintBurnAbi from './abis/DOSA2MintBurn.json';
import tokenAbi from './abis/DOSA2Coin-abi.json';

const baseApi = 'https://api.thegraph.com/subgraphs/name/saifiikmal/dosasubgraph'
const oracleApi = 'http://52.77.222.115:8000/api/v1/transactions?last_tx=true&asset_id='
const ipfsApi = 'https://ipfs.io/ipfs/'

export default {
  name: 'App',
  // components: {
  //   HelloWorld
  // }
  data() {
    return {
      connected: false,
      walletAddress: null,
      web3: null,
      baseNFTs: [],
      slots: [],
      consumables: [],
      slotAddress: "0x1fc1b2fda18bbcb43565c6806fceab7adf84d671",
      consumableAddress: "0x0BC8C31904362178E99098cAd20425fC988fa9A6",
      baseNFTAddress: "0xaeC49c66a05f3Aa87A77878d547d38159473E4e3",
      mergeAddress: "0xB636BebBc1Ad953EA09c2000fCFF584530394b62",
      mintBurnAddress: "0xc18d2bb23B6a3f9606199c00E064011168d9e983",
      creatorNFT: "0xd0330f184dc04B617F9eF76158de4647A7c0C910",
      creatorSlot: "0xC20de1a30487EC70Fc730866f297F2e2f1E411f7",
      tokenAddress: "0xb2d15fe6f37b6e50d165ec1edd3de72308c99b6f",
      options: [],
      valueSlot: {},
      valueConsumables: {},
      isLoading: false
    }
  },
  created() {
    // this.getTxs()
  },
  methods: {
    handleChange(type, id) {

    },
    async topup(amount) {
      new this.web3.eth.Contract(tokenAbi, this.tokenAddress).methods.approve(this.mintBurnAddress, amount).send({
              from: this.walletAddress,
              gas: 500000
            })
      new this.web3.eth.Contract(mintBurnAbi, this.mintBurnAddress).methods.topup(amount).send({
              from: this.walletAddress,
              gas: 500000
            })
    },
    async cashout(row) {
      if (row.data?.metadata?.token?.available > 0) {
        this.isLoading = true
        new this.web3.eth.Contract(baseNFTAbi, this.baseNFTAddress).methods.approve(this.creatorNFT, row.tokenId).send({
              from: this.walletAddress,
              gas: 500000
            })
        let res2 = await new this.web3.eth.Contract(mintBurnAbi, this.mintBurnAddress).methods.cashOut(row.tokenId).send({
              from: this.walletAddress,
              gas: 500000
            })
        console.log({res2})
        this.isLoading = false
      }
    },
    async equip(type, row) {
      if (type === 'slot') {
        if (this.valueSlot[row.id]) {
          console.log(this.valueSlot[row.id])
          this.isLoading = true
          let res = await new this.web3.eth.Contract(mergeNFTAbi, this.mergeAddress).methods.equip(this.baseNFTAddress, this.valueSlot[row.id], this.slotAddress, row.tokenId).send({
            from: this.walletAddress,
            gas: 500000
          })
          console.log({res})
          this.isLoading = false
          this.slots = this.slots.filter(item => item.id !== row.id)
        }
      }
    },
    async connect() {
      if (window.ethereum) { // first we check if metamask is installed
        const resp = await window.ethereum.request({ method: 'eth_requestAccounts' })
        console.log(resp, this.connected)
        if (resp) {
          this.connected = true
          this.walletAddress = resp[0]
          this.web3 = new Web3(window.ethereum)

          this.isLoading = true
          this.getBaseNFTs()
          this.getSlots()
          this.getConsumables()
          this.isLoading = false
        }
      }
    },
    urlReplacer(url) {
      let newUri = null
      if (url.startsWith("dosa://")) {
        url = url.replace("dosa://", "")
        newUri = `${oracleApi}${url}`
      }
      if (url.startsWith("ipfs://")) {
        url = url.replace("ipfs://", "")
        newUri = `${ipfsApi}${url}`
      }
      return newUri
    },
    async getMetadata(tokenUri) {
      let newUri = this.urlReplacer(tokenUri)
      let data = null

      if (newUri) {
        const resp = await axios.get(newUri)

        if (resp.data) {
          // console.log(resp.data)
          if (tokenUri.startsWith("dosa://")) {
            const found = resp.data[0]

            console.log({found})
            if (found) {
              data = {
                name: null,
                img: found.metadata?.parts?.body?.src ? this.urlReplacer(found.metadata.parts.body.src) : null,
                data: found
              }
            }
          }
          if (tokenUri.startsWith("ipfs://")) {
            data = {
                name: resp.data.description,
                img: this.urlReplacer(resp.data.image),
                data: resp.data
              }
          }
        }
      }
      return data
    },
    async getBaseNFTs() {
      console.log('getTxs')
      if (this.walletAddress) {
        const qry = `{
          baseNFTs(where: { owner: "`+this.walletAddress+`" }) {
              id
              owner
              tokenId
              blockNo
            }
          }`
        const resp = await axios({
          url: baseApi,
          method: 'post',
          data: {
            query: qry
          }
        });

        const qry2 = `{
          mintBurnCashOuts(where: { to: "`+this.walletAddress+`" }) {
              id
              to
              tokenId
              blockNo
            }
          }`
        const resp2 = await axios({
          url: baseApi,
          method: 'post',
          data: {
            query: qry2
          }
        });
        let baseNFTs = []
        let options = []

        if (resp.data && resp.data.data && resp.data.data.baseNFTs) {
         
          
          for(let item of resp.data.data.baseNFTs) {
            let res = await new this.web3.eth.Contract(baseNFTAbi, this.baseNFTAddress).methods.tokenURI(item.tokenId).call()
            res = res.trim()
            const data = await this.getMetadata(res)
            
            baseNFTs.push({
              ...item,
              ...data,
              tokenUri: res
            })
            options.push({
              value: item.tokenId,
              label: `Rocket ${item.tokenId}`
            })
          }
          
        }

        if (resp2.data && resp2.data.data && resp2.data.data.mintBurnCashOuts) {
          const burns = resp2.data.data.mintBurnCashOuts.map(m => m.tokenId)
          baseNFTs = baseNFTs.filter(m => burns.indexOf(m.tokenId) < 0)
          options = options.filter(m => burns.indexOf(m.value) < 0)
        }

        this.baseNFTs = baseNFTs
        this.options = options
        console.log(this.baseNFTs)
      }
    },
    async getSlots() {
      console.log('getSlots')
      if (this.walletAddress) {
        const qry = `{
          slotMints(where: { to: "`+this.walletAddress+`" }) {
              id
              from
              to
              tokenId
              blockNo
            }
          }`
        const resp = await axios({
          url: baseApi,
          method: 'post',
          data: {
            query: qry
          }
        });
        if (resp.data && resp.data.data && resp.data.data.slotMints) {
          const slots = []
          for (let item of resp.data.data.slotMints){
            try {
              let res = await new this.web3.eth.Contract(slotNFTAbi, this.slotAddress).methods.tokenURI(item.tokenId).call()
              if (res) {
                res = res.trim()
                console.log({res})
                const data = await this.getMetadata(res)
                
                slots.push({
                  ...item,
                  ...data,
                  tokenUri: res
                })
              }
            } catch(err) {
              //
            }

          }
          this.slots = slots
          console.log(this.slots)
        }
      }
    },
    async getConsumables() {
      console.log('getConsumables')
      if (this.walletAddress) {
        const qry = `{
          consumablesMints(where: { to: "`+this.walletAddress+`" }) {
              id
              operator
              from
              to
              tokenId
              value
              blockNo
            }
          }`
        const resp = await axios({
          url: baseApi,
          method: 'post',
          data: {
            query: qry
          }
        });

        let consumables = []

        if (resp.data && resp.data.data && resp.data.data.consumablesMints) {
          for (let item of resp.data.data.consumablesMints){
            try {
              let res = await new this.web3.eth.Contract(consumablesNFTAbi, this.consumableAddress).methods.uri(item.tokenId).call()
              if(res) {
                res = res.trim().replace("{id}", item.tokenId)
                console.log({res})
                const data = await this.getMetadata(res)

                let balance = await new this.web3.eth.Contract(consumablesNFTAbi, this.consumableAddress).methods.balanceOf(this.walletAddress, item.tokenId).call()
                
                consumables.push({
                  ...item,
                  ...data,
                  tokenUri: res,
                  balance: parseInt(balance)
                })
              }
            } catch (error) {
              //
            }
          }

          
        }

        this.consumables = consumables
        console.log(this.consumables)
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0 auto;
}
</style>
