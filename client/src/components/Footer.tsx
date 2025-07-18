import { HandHeart, Facebook, Twitter, Linkedin, Youtube, Mail, Globe } from "lucide-react";
import B2BLogo from "./B2BLogo";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center mb-4">
              <B2BLogo size="md" className="mr-3" />
              <div>
                <h4 className="text-xl font-bold">B2B MARKET</h4>
                <p className="text-sm text-gray-400">Global Business Platform</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Bringing people and business together on an international platform
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Youtube className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h5 className="font-bold mb-4">Quick Links</h5>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/" className="hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="/buy-business" className="hover:text-white transition-colors">Buy a Business</a>
              </li>
              <li>
                <a href="/sell-business" className="hover:text-white transition-colors">Sell Your Business</a>
              </li>
              <li>
                <a href="/post-ad" className="hover:text-white transition-colors">Post An Ad</a>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h5 className="font-bold mb-4">Support</h5>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
              </li>
              <li>
                <a href="/about" className="hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white transition-colors">Contact Us</a>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h5 className="font-bold mb-4">Contact Info</h5>
            <div className="space-y-2 text-gray-400">
              <p className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                btwobmarket@gmail.com
              </p>
              <p className="flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                Global Platform
              </p>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-700 pt-8 mt-8 text-center text-gray-400">
          <p>&copy; 2024 B2B Market. All rights reserved. | A single Integrated platform for your business buying and selling needs</p>
        </div>
      </div>
    </footer>
  );
}
