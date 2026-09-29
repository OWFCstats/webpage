import { AdminRow } from '../AdminList';

const SAID = { true: 'Said in', false: 'Said out' };

/**
 * One chat member's answer to one poll: In, Out, or nothing yet. Tapping the
 * answer already given clears it back to no reply, which is how a mistake is
 * undone — there is no third button to find.
 */
export default function AnswerRow({ player, answer, onAnswer }) {
  const pick = (value) => onAnswer(answer === value ? null : value);
  return (
    <AdminRow
      inline
      title={
        <>
          {player.name}
          {!player.in_chat && <span className="tag orange">not in chat</span>}
        </>
      }
      meta={SAID[answer] ?? 'No reply'}
      actions={
        <span className="seg" role="group" aria-label={`${player.name}’s answer`}>
          <button
            type="button"
            className={`said-in${answer === true ? ' active' : ''}`}
            aria-pressed={answer === true}
            onClick={() => pick(true)}
          >
            In
          </button>
          <button
            type="button"
            className={`said-out${answer === false ? ' active' : ''}`}
            aria-pressed={answer === false}
            onClick={() => pick(false)}
          >
            Out
          </button>
        </span>
      }
    />
  );
}
