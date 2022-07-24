// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class Equip extends ethereum.Event {
  get params(): Equip__Params {
    return new Equip__Params(this);
  }
}

export class Equip__Params {
  _event: Equip;

  constructor(event: Equip) {
    this._event = event;
  }

  get baseAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get baseTokenId(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get consumableAddress(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get consumableTokenId(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class OwnershipTransferred extends ethereum.Event {
  get params(): OwnershipTransferred__Params {
    return new OwnershipTransferred__Params(this);
  }
}

export class OwnershipTransferred__Params {
  _event: OwnershipTransferred;

  constructor(event: OwnershipTransferred) {
    this._event = event;
  }

  get previousOwner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newOwner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class DosaMergeNFT extends ethereum.SmartContract {
  static bind(address: Address): DosaMergeNFT {
    return new DosaMergeNFT("DosaMergeNFT", address);
  }

  owner(): Address {
    let result = super.call("owner", "owner():(address)", []);

    return result[0].toAddress();
  }

  try_owner(): ethereum.CallResult<Address> {
    let result = super.tryCall("owner", "owner():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class EquipCall extends ethereum.Call {
  get inputs(): EquipCall__Inputs {
    return new EquipCall__Inputs(this);
  }

  get outputs(): EquipCall__Outputs {
    return new EquipCall__Outputs(this);
  }
}

export class EquipCall__Inputs {
  _call: EquipCall;

  constructor(call: EquipCall) {
    this._call = call;
  }

  get baseAddress(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get baseTokenId(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get consumableAddress(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get consumableTokenId(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }
}

export class EquipCall__Outputs {
  _call: EquipCall;

  constructor(call: EquipCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall extends ethereum.Call {
  get inputs(): RenounceOwnershipCall__Inputs {
    return new RenounceOwnershipCall__Inputs(this);
  }

  get outputs(): RenounceOwnershipCall__Outputs {
    return new RenounceOwnershipCall__Outputs(this);
  }
}

export class RenounceOwnershipCall__Inputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall__Outputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class TransferOwnershipCall extends ethereum.Call {
  get inputs(): TransferOwnershipCall__Inputs {
    return new TransferOwnershipCall__Inputs(this);
  }

  get outputs(): TransferOwnershipCall__Outputs {
    return new TransferOwnershipCall__Outputs(this);
  }
}

export class TransferOwnershipCall__Inputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }

  get newOwner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TransferOwnershipCall__Outputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }
}
