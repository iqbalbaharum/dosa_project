import axios from 'axios'

export class CovalentDbModule {
  
  private getCovalentHq() {
    return axios.create({
      baseURL: process.env.COVALENTHQ_URL,
      timeout: 5000
    })
  }

  getNftMetadata(chain_id: string, address: string, token_id: string) {
    const request = this.getCovalentHq()
    return request.get(`/${chain_id}/tokens/${address}/nft_metadata/${token_id}/?format=json&key=${process.env.COVALENTHQ_API_KEY}`)
  }
}