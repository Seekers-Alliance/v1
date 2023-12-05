
CONTRACT="0xDFA09a9F9edEdA009578d85baFc9AD92a4597424"
METHOD="ids(uint256 _index)"
RPC_URL="https://avalanche-fuji-c-chain.publicnode.com"


#cast call --rpc-url=$RPC_URL $CONTRACT $METHOD "0"

cast call --rpc-url=$RPC_URL $CONTRACT "function maxAmounts(uint256 _index) returns (uint32)" "0"
