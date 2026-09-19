import Workspace from '@/components/plume/workspace';
export default async function Investigation({params}:{params:Promise<{caseId:string}>}){const {caseId}=await params;return <Workspace caseId={caseId}/>}
