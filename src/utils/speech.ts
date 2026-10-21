/** Reads text aloud with the browser's speech synthesis. */
export function speak(text: string, lang: string) {
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}
