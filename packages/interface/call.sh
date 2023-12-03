
CONTRACT="0x20307370C2560FA870BB49808F7063dc7E9b38cd"
METHOD="ids(uint256 _index)"
RPC_URL="https://avalanche-fuji-c-chain.publicnode.com"


cast call --rpc-url=$RPC_URL $CONTRACT $METHOD "0"
