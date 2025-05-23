'use client';

export default function ContactFormSection() {
  return (
    <section>
      <h1>Contact Us</h1>
      <form>
        <input type="text" placeholder="Your Name" />
        <input type="email" placeholder="Your Email" />
        <textarea placeholder="Your Message" />
        <button type="submit">Send</button>
      </form>
    </section>
  );
}
