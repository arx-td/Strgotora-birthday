import { useForm, ValidationError } from '@formspree/react'

export default function ReplyForm() {
  const [state, handleSubmit] = useForm('mkodoggq')

  if (state.succeeded) {
    return <p className="reply-sent">Sent 💌</p>
  }

  return (
    <form className="reply-box" onSubmit={handleSubmit}>
      <input type="hidden" name="_subject" value="Strgotora sent you a reply 💌" />
      <input
        type="text"
        name="message"
        className="reply-input"
        placeholder="write a little something back..."
        maxLength={200}
        required
      />
      <button className="reply-btn" type="submit" disabled={state.submitting}>
        {state.submitting ? 'Sending…' : 'Send 💌'}
      </button>
      <ValidationError
        field="message"
        prefix="Message"
        errors={state.errors}
        className="reply-error"
      />
    </form>
  )
}
