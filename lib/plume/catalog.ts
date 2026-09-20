import type {Observation} from './types';
export type CatalogObservation = Pick<Observation,'id'|'date'|'acquisitionId'|'instrument'|'location'|'sourceUrl'|'outline'> & {caseId?:string};
export type RegionalCatalog = {id:string;retrievedAt:string;bbox:number[];observations:CatalogObservation[]};
