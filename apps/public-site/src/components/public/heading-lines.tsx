import { Fragment } from "react";

// The reference design breaks most headings across two lines with a literal
// <br/>. CMS heading fields are plain text (no markup stored in the database,
// deliberately), so a newline in the stored value is the editable equivalent —
// an editor presses Enter in the Heading textarea and gets the same break.

export function HeadingLines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, index) => (
        <Fragment key={index}>
          {index > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

// PageIntro's variant of the same idea: the first line is solid white, every
// line after it renders in the reference's outlined/stroked treatment.
export function AccentHeadingLines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, index) => (
        <Fragment key={index}>
          {index > 0 && <br />}
          {index === 0 ? (
            line
          ) : (
            <span className="text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.7)]">{line}</span>
          )}
        </Fragment>
      ))}
    </>
  );
}
