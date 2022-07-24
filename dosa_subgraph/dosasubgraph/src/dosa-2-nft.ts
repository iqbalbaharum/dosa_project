import { BigInt, log } from "@graphprotocol/graph-ts"
import {
  Dosa2NFT,
  Approval,
  ApprovalForAll,
  Mint,
  OwnershipTransferred,
  Paused,
  Sale,
  Transfer,
  Unpaused
} from "../generated/Dosa2NFT/Dosa2NFT"
import { BaseNFT, BaseNFTTransfer } from "../generated/schema"

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleMint(event: Mint): void {
  let entity = BaseNFT.load(event.transaction.hash.toHex())
  if (!entity) {
    entity = new BaseNFT(event.transaction.hash.toHex())
  }
  entity.owner = event.params.to
  entity.tokenId = event.params.tokenId
  entity.blockNo = event.block.number
  entity.save()
  log.info('Mint for: {} with tokenId {}', [event.params.to.toHexString(), event.params.tokenId.toString()])
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handlePaused(event: Paused): void {}

export function handleSale(event: Sale): void {}

export function handleTransfer(event: Transfer): void {
  let entity = BaseNFTTransfer.load(event.transaction.hash.toHex())
  if (!entity) {
    entity = new BaseNFTTransfer(event.transaction.hash.toHex())
  }
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId
  entity.blockNo = event.block.number
  entity.save()
  log.info('Transfer: {} to {} with tokenId {}', [event.params.from.toHexString(), event.params.to.toHexString(), event.params.tokenId.toString()])
}

export function handleUnpaused(event: Unpaused): void {}
