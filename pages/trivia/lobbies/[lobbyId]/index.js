import React from "reactn";
import { useRouter } from "next/router";
import { Lobby } from "../../../../src/pages/lobbies/_lobbyId";
import { SEOMeta } from "../../../../src/components/common/seo";
import { CreateLobby } from "../../../../src/pages/lobbies/_lobbyId/CreateLobby";
import { getPlaiceholder } from "plaiceholder";
import { resourcesURL } from "../../../../src/components/common/DataList";


// This function runs only on the server side
export async function getStaticProps() {
  const resourcesPromises = resourcesURL.map(async (resource) => {
    const { base64 } = await getPlaiceholder(resource.url, { size: 10 });
    resource.base64 = base64;

    return resource;
  });

  const resources = await Promise.all(resourcesPromises);

  const resourcesBlur = resources.reduce((acc, resource) => {
    acc[resource.name] = {
      blurBase64: resource.base64,
      url: resource.url,
    };

    return acc;
  }, {});

  return { props: { resources: resourcesBlur } };
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
};

const LobbyPage = (props) => {
  const router = useRouter();
  const { lobbyId } = router.query;

  return (
    <>
      <SEOMeta {...props} />
      {lobbyId === "new" ? <CreateLobby {...props} /> : <Lobby {...props} />}
    </>
  );
};

export default LobbyPage;
