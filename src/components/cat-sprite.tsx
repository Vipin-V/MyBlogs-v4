import type { CatPose } from "@/lib/cat-state";

/** Original pixel artwork with the three poses supplied in the references. */
export function CatSprite({ pose }: { pose: CatPose }) {
  const sleeping = pose === "sleeping";
  const attacking = pose === "attacking";
  return (
    <svg aria-hidden viewBox="0 0 40 40" shapeRendering="crispEdges" className={`cat-sprite ${attacking ? "cat-attack" : sleeping ? "cat-sleep" : ""}`}>
      <g className="fill-cat-outline">
        {sleeping ? <path d="M6 20h3v-8h4v3h10v-3h4v7h6v3h3v11h-3v3H13v-3H6z" /> : <path d="M10 4h4v4h12V4h4v12h3v7h-5v4h3v9h-7v-3h-4v3h-8V25H7V12h3z" />}
      </g>
      {sleeping ? (
        <>
          <path className="fill-cat-fur" d="M8 21h3v-7h2v3h12v-3h1v7h6v3h2v8h-3v2H14v-3H8z" />
          <path className="fill-cat-shade" d="M18 30h8v-6h3v8H18zM12 28h4v3h-4z" />
          <path className="fill-cat-outline" d="M10 24h5v2h-5zM20 24h5v2h-5zM15 29h5v2h-5zM28 21h3v3h-3z" />
          <path className="fill-cat-pink" d="M12 16h2v3h-2zM24 16h2v3h-2zM17 26h2v2h-2z" />
          <text x="26" y="9" className="fill-muted-foreground" fontSize="5" fontFamily="monospace">z</text><text x="31" y="5" className="fill-muted-foreground" fontSize="4" fontFamily="monospace">z</text>
        </>
      ) : (
        <>
          <path className="fill-cat-fur" d="M11 7h2v3h14V7h2v11h2v4h-5v5h3v7h-4v-4h-7v4h-4V24H9V14h2z" />
          <path className="fill-cat-shade" d="M22 24h4v3h2v6h-3v-5h-3zM15 25h3v6h-3z" />
          <path className="fill-cat-pink" d="M11 10h3v3h-3zM26 10h3v3h-3zM18 19h3v2h-3z" />
          <path className="fill-cat-outline" d={attacking ? "M12 15h6v2h-4v2h-2zM23 15h5v4h-2v-2h-3zM18 22h4v2h-4z" : "M12 15h5v4h-5zM23 15h5v4h-5zM18 22h4v1h-4z"} />
          {!attacking && <><path className="fill-cat-eye" d="M13 16h2v3h-2zM24 16h2v3h-2z" /><path className="fill-cat-fur" d="M12 15h1v1h-1zM23 15h1v1h-1z" /></>}
          <path className="fill-cat-outline" d="M29 29h4v-6h3v-4h2v7h-3v6h-6z" /><path className="fill-cat-fur" d="M30 29h2v-5h2v6h-4zM35 20h2v4h-2z" />
          {attacking && <><path className="fill-cat-outline" d="M4 22h4v3h5v4H8v-3H4z" /><path className="fill-cat-fur" d="M3 20h4v4h4v3H8v-2H3z" /><path className="fill-cat-pink" d="M3 20h2v2H3z" /><path className="fill-cat-shade" d="M1 12h2v5H1zM4 10h2v5H4zM7 8h2v5H7z" /></>}
        </>
      )}
    </svg>
  );
}