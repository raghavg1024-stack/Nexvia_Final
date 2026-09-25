const BULLET = "•";

export function MentorReply({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/);

  return (
    <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const bullets = lines.filter((line) => line.startsWith(BULLET));
        const rest = lines.filter((line) => !line.startsWith(BULLET));
        if (bullets.length > 0 && rest.length === 0) {
          return (
            <ul key={i} className="my-2 space-y-1.5 list-disc">
              {bullets.map((line) => (
                <li key={line} className="marker:text-indigo-400">
                  {line.replace(BULLET, "").trim()}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="my-2">
            {lines.map((line, j) => (
              <span key={j}>
                {line.startsWith(BULLET) ? (
                  <>
                    <span className="mr-2 text-indigo-400">{BULLET}</span>
                    {line.replace(BULLET, "").trim()}
                  </>
                ) : (
                  line
                )}
                {j < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}