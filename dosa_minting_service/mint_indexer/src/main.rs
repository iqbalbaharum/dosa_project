use marine_rs_sdk::{marine, module_manifest, MountedBinaryResult};
// use serde_json;

#[macro_use]
extern crate fstrings;

module_manifest!();

pub fn main() {}

#[marine]
pub fn get_latest_block() -> String {

    let url =
        f!("https://api.thegraph.com/subgraphs/name/saifiikmal/dosasubgraph");
    
    // let body = String::from(r#"{"query":"query {
    //         baseNFTs(where: {
    //             blockNo_gt: {BLOCK_NO}
    //         }) {
    //             id
    //             owner
    //             tokenId
    //             blockNo
    //         }
    //     }"}"#)
    // .replace("{BLOCK_NO}", "27225933");

    let body = String::from("{\"query\":\"query {\n    baseNFTs(where: {\n        blockNo_gt: 27225933\n    }) {\n    id\n    owner\n    tokenId\n    blockNo\n  }\n}\"}")

    let curl_cmd = vec![
        "-X".to_string(),
        "POST".to_string(),
        "-H".to_string(),
        "Content-Type: application/json".to_string(),
        "-d".to_string(),
        body,
        url,
    ];
    
    println!("{:?}", curl_cmd);

    let response = curl_request(curl_cmd);
    // let result = String::from_utf8(response.stdout);
    
    String::from_utf8(response.stdout).unwrap()
}

#[marine]
#[link(wasm_import_module = "curl_adapter")]
extern "C" {
    pub fn curl_request(cmd: Vec<String>) -> MountedBinaryResult;
}