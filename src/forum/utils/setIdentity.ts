import Identities from 'orbit-db-identity-provider';
import { getResolver } from '@ceramicnetwork/3id-did-resolver';

// Connects the logged in Ceramic user to OrbitDB
export async function setIdentity({ orbitdb, registry }, { ceramic, threeId }) {
  if (orbitdb.identity.type !== 'did') {
    Identities.DIDIdentityProvider.setDIDResolver(getResolver(ceramic));
    const identity = await Identities.createIdentity({
      type: 'DID',
      didProvider: threeId.getDidProvider(),
    });
    orbitdb.identity = identity;
    registry.setIdentity(identity);
    console.log('OrbitDB: DID identity set!', identity);
  }
}
