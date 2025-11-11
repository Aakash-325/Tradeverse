const Footer = () => {
    return (
      <footer className="hidden md:block w-full bg-white dark:bg-zinc-900 py-3 px-6 text-sm text-center text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} TradeVerse. All rights reserved.
      </footer>
    );
  };
  
  export default Footer;
  