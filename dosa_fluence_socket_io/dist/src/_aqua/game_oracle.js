"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetch_user_rocket = exports.registerIDosaGameService = void 0;
const v3_1 = require("@fluencelabs/fluence/dist/internal/compilerSupport/v3");
function registerIDosaGameService(...args) {
    (0, v3_1.registerService)(args, {
        "functions": {
            "tag": "labeledProduct",
            "fields": {
                "add_point": {
                    "tag": "arrow",
                    "domain": {
                        "tag": "labeledProduct",
                        "fields": {
                            "id": {
                                "tag": "scalar",
                                "name": "string"
                            },
                            "kill": {
                                "tag": "scalar",
                                "name": "f32"
                            }
                        }
                    },
                    "codomain": {
                        "tag": "unlabeledProduct",
                        "items": [
                            {
                                "tag": "scalar",
                                "name": "string"
                            }
                        ]
                    }
                },
                "fetch_nft_metadata": {
                    "tag": "arrow",
                    "domain": {
                        "tag": "labeledProduct",
                        "fields": {
                            "nft": {
                                "tag": "struct",
                                "name": "UserNFT",
                                "fields": {
                                    "chainId": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "tokenId": {
                                        "tag": "scalar",
                                        "name": "f32"
                                    },
                                    "tokenAddress": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "address": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "metadata": {
                                        "tag": "scalar",
                                        "name": "string"
                                    }
                                }
                            }
                        }
                    },
                    "codomain": {
                        "tag": "unlabeledProduct",
                        "items": [
                            {
                                "tag": "struct",
                                "name": "UserNFT",
                                "fields": {
                                    "chainId": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "tokenId": {
                                        "tag": "scalar",
                                        "name": "f32"
                                    },
                                    "tokenAddress": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "address": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "metadata": {
                                        "tag": "scalar",
                                        "name": "string"
                                    }
                                }
                            }
                        ]
                    }
                },
                "fetch_nft_token_uri": {
                    "tag": "arrow",
                    "domain": {
                        "tag": "labeledProduct",
                        "fields": {
                            "nft": {
                                "tag": "struct",
                                "name": "UserNFT",
                                "fields": {
                                    "chainId": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "tokenId": {
                                        "tag": "scalar",
                                        "name": "f32"
                                    },
                                    "tokenAddress": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "address": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "metadata": {
                                        "tag": "scalar",
                                        "name": "string"
                                    }
                                }
                            }
                        }
                    },
                    "codomain": {
                        "tag": "unlabeledProduct",
                        "items": [
                            {
                                "tag": "struct",
                                "name": "UserNFT",
                                "fields": {
                                    "chainId": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "tokenId": {
                                        "tag": "scalar",
                                        "name": "f32"
                                    },
                                    "tokenAddress": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "address": {
                                        "tag": "scalar",
                                        "name": "string"
                                    },
                                    "metadata": {
                                        "tag": "scalar",
                                        "name": "string"
                                    }
                                }
                            }
                        ]
                    }
                },
                "get_user_rockets": {
                    "tag": "arrow",
                    "domain": {
                        "tag": "labeledProduct",
                        "fields": {
                            "address": {
                                "tag": "scalar",
                                "name": "string"
                            }
                        }
                    },
                    "codomain": {
                        "tag": "unlabeledProduct",
                        "items": [
                            {
                                "tag": "array",
                                "type": {
                                    "tag": "struct",
                                    "name": "UserNFT",
                                    "fields": {
                                        "chainId": {
                                            "tag": "scalar",
                                            "name": "string"
                                        },
                                        "tokenId": {
                                            "tag": "scalar",
                                            "name": "f32"
                                        },
                                        "tokenAddress": {
                                            "tag": "scalar",
                                            "name": "string"
                                        },
                                        "address": {
                                            "tag": "scalar",
                                            "name": "string"
                                        },
                                        "metadata": {
                                            "tag": "scalar",
                                            "name": "string"
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                "level_up": {
                    "tag": "arrow",
                    "domain": {
                        "tag": "labeledProduct",
                        "fields": {
                            "id": {
                                "tag": "scalar",
                                "name": "string"
                            }
                        }
                    },
                    "codomain": {
                        "tag": "unlabeledProduct",
                        "items": [
                            {
                                "tag": "scalar",
                                "name": "string"
                            }
                        ]
                    }
                }
            }
        }
    });
}
exports.registerIDosaGameService = registerIDosaGameService;
function fetch_user_rocket(...args) {
    let script = `
                    (xor
                     (seq
                      (seq
                       (seq
                        (call %init_peer_id% ("getDataSrv" "-relay-") [] -relay-)
                        (call %init_peer_id% ("getDataSrv" "address") [] address)
                       )
                       (new $nfts
                        (seq
                         (seq
                          (seq
                           (call -relay- ("op" "noop") [])
                           (call "12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e" ("op" "noop") [])
                          )
                          (xor
                           (seq
                            (seq
                             (seq
                              (call "12D3KooWR2Fcs8KLsrNhULeUgn9d9totR14FEnaVqJZC7ESrRfZA" ("dosagameservice" "get_user_rockets") [address] rockets)
                              (fold rockets rocket-0
                               (seq
                                (seq
                                 (call "12D3KooWR2Fcs8KLsrNhULeUgn9d9totR14FEnaVqJZC7ESrRfZA" ("dosagameservice" "fetch_nft_token_uri") [rocket-0] rocketWithUrl)
                                 (call "12D3KooWR2Fcs8KLsrNhULeUgn9d9totR14FEnaVqJZC7ESrRfZA" ("dosagameservice" "fetch_nft_metadata") [rocketWithUrl] $nfts)
                                )
                                (next rocket-0)
                               )
                              )
                             )
                             (call "12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e" ("op" "noop") [])
                            )
                            (call -relay- ("op" "noop") [])
                           )
                           (seq
                            (seq
                             (call "12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e" ("op" "noop") [])
                             (call -relay- ("op" "noop") [])
                            )
                            (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
                           )
                          )
                         )
                         (call %init_peer_id% ("op" "identity") [$nfts] nfts-fix)
                        )
                       )
                      )
                      (xor
                       (call %init_peer_id% ("callbackSrv" "response") [nfts-fix])
                       (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
                      )
                     )
                     (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 3])
                    )
    `;
    return (0, v3_1.callFunction)(args, {
        "functionName": "fetch_user_rocket",
        "arrow": {
            "tag": "arrow",
            "domain": {
                "tag": "labeledProduct",
                "fields": {
                    "address": {
                        "tag": "scalar",
                        "name": "string"
                    }
                }
            },
            "codomain": {
                "tag": "unlabeledProduct",
                "items": [
                    {
                        "tag": "array",
                        "type": {
                            "tag": "struct",
                            "name": "UserNFT",
                            "fields": {
                                "chainId": {
                                    "tag": "scalar",
                                    "name": "string"
                                },
                                "tokenId": {
                                    "tag": "scalar",
                                    "name": "f32"
                                },
                                "tokenAddress": {
                                    "tag": "scalar",
                                    "name": "string"
                                },
                                "address": {
                                    "tag": "scalar",
                                    "name": "string"
                                },
                                "metadata": {
                                    "tag": "scalar",
                                    "name": "string"
                                }
                            }
                        }
                    }
                ]
            }
        },
        "names": {
            "relay": "-relay-",
            "getDataSrv": "getDataSrv",
            "callbackSrv": "callbackSrv",
            "responseSrv": "callbackSrv",
            "responseFnName": "response",
            "errorHandlingSrv": "errorHandlingSrv",
            "errorFnName": "error"
        }
    }, script);
}
exports.fetch_user_rocket = fetch_user_rocket;
