'use client';

export default function LocationMapSection() {
  return (
    <section>
      <h2>Our Location</h2>
      <iframe
        src="https://maps.google.com/maps?q=Berlin&t=&z=13&ie=UTF8&iwloc=&output=embed"
        width="100%"
        height="300"
        loading="lazy"
      ></iframe>
    </section>
  );
}
