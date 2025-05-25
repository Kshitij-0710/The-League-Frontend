import { Typography } from "@material-tailwind/react";

export function Footer() {
  return (
    <footer className="py-4 bg-black/60 backdrop-blur-sm border-t border-white/5">
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Typography variant="small" className="text-center text-white/60">
          Designed and Developed by Kshitij, Harshit, and Meghana
        </Typography>
      </div>
    </footer>
  );
}

Footer.displayName = "/src/widgets/layout/footer.jsx";

export default Footer;
