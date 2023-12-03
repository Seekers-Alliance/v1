import useDrawingConfig from "@/hooks/useDrawingConfig";
import {useContractReads, useContractWrite} from "wagmi";
import {parseAbi} from "viem";
import {QueryResult} from "@/types";

interface DrawingRead {
    id:bigint
}

export default function useDrawingRead():QueryResult<DrawingRead>{
    const config = useDrawingConfig();
    const drawingConfig={
        address:config.address,
        abi:parseAbi([
            'function ids(uint256 _index) returns (uint256)',
        ]),
    }
    const contracts=[
        {
            ...drawingConfig,
            functionName:'ids',
            args:[0],
            chainId:43113,
        }
    ]
    const reads=useContractReads({
        contracts:contracts,
    })
    console.log(reads)
    if (!reads.data) {
        return { ...reads, data: null };
    }
    const results = [];
    for (let i = 0; i < 1; i++) {
        if (reads.data[i].result === undefined) {
            return { ...reads, data: null };
        }
        results.push(reads.data[i].result);
    }
    return {
        ...reads,
        data: {
            id: results[0] as bigint,
        },
    };
}
