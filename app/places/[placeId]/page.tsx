import PlaceWorkspace from '@/components/plume/place-workspace';
export default async function PlacePage({params,searchParams}:{params:Promise<{placeId:string}>;searchParams:Promise<{radius?:string}>}){
 const [{placeId},{radius}]=await Promise.all([params,searchParams]);
 return <PlaceWorkspace key={placeId} placeId={placeId} initialRadius={[10,25,50,100].includes(Number(radius))?Number(radius):25}/>;
}
