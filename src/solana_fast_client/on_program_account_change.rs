use {
    serde::{Deserialize, Serialize},
    solana_client::rpc_config::RpcProgramAccountsConfig,
    solana_client::rpc_filter::RpcFilterType,
};

#[derive(Serialize, Deserialize)]
pub struct ProgramAccountsInfoConfig {
    pub filters: Option<Vec<RpcFilterType>>,
    pub account_config: RpcProgramAccountsConfig,
    pub with_context: Option<bool>,
}