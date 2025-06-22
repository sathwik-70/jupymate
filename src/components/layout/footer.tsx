const Footer = () => {
  return (
    <footer className="py-8 mt-16 border-t">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p className="font-medium">
          Crafted by <a href="https://github.com/sathwik-70" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Sathwik Pamu</a> for Namaste Jupiverse Hackathon.
        </p>
        <p className="mt-1">Powered by Jupiter • Built on Solana • Open Source License</p>
        <p className="mt-4 text-xs italic max-w-2xl mx-auto">
          "Revolutionizing DeFi usability on Solana. Swap any token, pay any token — securely, visually, and with governance intelligence."
        </p>
      </div>
    </footer>
  );
};
export default Footer;
