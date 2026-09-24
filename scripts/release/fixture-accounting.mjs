// Synthetic test material only; production inventories must inspect image bytes.
import {sha256} from './contracts.mjs';
export function fixtureAccounting(inventory,manifest){
 const notice=Object.keys(manifest.files).find(k=>k==='LICENSE'||k==='COPYING');
 const occurrence=id=>({id,notices:[{path:'/fixture/'+id,sha256:manifest.files[notice]}]});
 for(const p of inventory.os)p.shipped=[occurrence(`deb:${p.sourcePackage}@${p.sourceVersion}`)];
 for(const p of inventory.packages)p.shipped=[occurrence(`npm:${p.name}@${p.version}`)];
 inventory.nativeShipped=Object.fromEntries(Object.entries(inventory.nativeVersions).map(([n,v])=>[n,[occurrence(`vips:${n}@${v}`)]]));
 for(const c of manifest.components){c.shipped=[c.id];c.noticeCoverage=[{imagePath:'/fixture/'+c.id,material:notice}];}
 manifest.inventorySha256=sha256(JSON.stringify(inventory));
}
