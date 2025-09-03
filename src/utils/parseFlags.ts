export type NoteTypes = 'Single' | 'Hold' | 'Flick' | 'Trace';

export interface Flags {
  noteType: NoteTypes;
  R1: number;
  R2: number;
  L1: number;
  L2: number;
}

export function parseFlags(val: number): Flags {
  const numericNoteType = val & 0xf;
  let noteType: NoteTypes;

  switch (numericNoteType) {
    case 0:
      noteType = 'Single';
      break;
    case 1:
      noteType = 'Hold';
      break;
    case 2:
      noteType = 'Flick';
      break;
    case 3:
      noteType = 'Trace';
      break;
    default:
      // Handle unexpected values, perhaps by throwing an error or assigning a default
      // For this example, we'll default to "Single", but in a real app, you might want more robust error handling.
      noteType = 'Single';
      console.warn(`Unexpected numeric note type: ${numericNoteType}. Defaulting to "Single".`);
      break;
  }

  const R1 = (val >>> 4) & 0x3f;
  const R2 = (val >>> 10) & 0x3f;
  const L1 = (val >>> 16) & 0x3f;
  const L2 = (val >>> 22) & 0x3f;

  return {
    noteType,
    R1,
    R2,
    L1,
    L2
  };
}
