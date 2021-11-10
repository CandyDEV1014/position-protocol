// @ts-ignore
import {ethers, upgrades} from "ethers";

const Datastore = require('nedb');
// import {Datastore} from 'nedb';


const POSITION_MANAGER = './positionManager.db';

export interface CreatePositionManagerInput {
    quoteAsset: string;
    initialPrice: number;
    priceFeedKey: string;
    basisPoint: number;
    baseBasisPoint: number;
    tollRatio: number;
    maxFindingWordsIndex: number;
    fundingPeriod: number;
    priceFeed: string;
}

interface PositionManager {
    symbol: string,
    address: string
}

export class ContractWrapperFactory {

    db: typeof Datastore;

    constructor() {

        // this.db = new Datastore({ filename: 'path/to/datafile', autoload: true });


        this.db = new Datastore({POSITION_MANAGER, autoload: true});
    }

    async createPositionManager(args: CreatePositionManagerInput) {
        console.log('db: ', this.db);
        console.log(` into createPositionManager`);
        // @ts-ignore
        const PositionManager = await ethers.getContractFactory("PositionManager")
        const isContractExists = false; // TODO implement
        // upgrade
        const contractAddress = '';

        this.db.find({symbol: `${args.quoteAsset.toLowerCase()}`}, function (err: Error, docs: any) {

            if (docs) {
                console.log(`docs ${docs}`);
                // this.isContractExists = true;
                // this.contractAddress = ((docs as unknown) as PositionManager).address.toString();
            }
        })

        if (isContractExists) {

            const upgraded = await upgrades.upgradeProxy(contractAddress, PositionManager);

            // @ts-ignore
            this.db.update({
                symbol: `${args.quoteAsset.toLowerCase()}`,
                address: upgraded.address
            }, function (err: Error, docs: any) {

            })


        } else {
            const contractArgs = [
                args.initialPrice,
                args.quoteAsset,
                args.priceFeed,
                args.basisPoint,
                args.baseBasisPoint,
                args.tollRatio,
                args.fundingPeriod,
                args.priceFeed];

            const instance = await upgrades.deployProxy(PositionManager, [...contractArgs]);
            await instance.deployed();

            const address = instance.address.toString().toLowerCase();

            // @ts-ignore
            this.db.update({
                symbol: `${args.quoteAsset.toLowerCase()}`,
                address: address
            }, function (err: Error, docs: any) {

            })
            // TODO save contract instance by quote and base asset
        }
    }

}