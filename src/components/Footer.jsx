import { Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <div className="w-full h-14 bg-[#0a0729] flex justify-center items-center mt-12">
      <p className="text-white font-semibold mr-5 text-xs p-2 sm:text-sm md:text-base">
        © 2024. Made by Luka Vlahovic, All rights reserved.
      </p>
      <div className="flex space-x-4 p-2">
        <a 
          href="https://github.com/luka-vlahovic-0/Nex-Exchange"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github />
        </a>
        <a
          href="https://www.linkedin.com/in/luka-vlahovic-657162281/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin />
        </a>
      </div>
    </div>
  );
}
