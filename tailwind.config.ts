import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				blockchain: {
					DEFAULT: 'hsl(var(--blockchain))',
					foreground: 'hsl(var(--blockchain-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				blob: {
					'0%': {
						transform: 'translate(0px, 0px) scale(1)',
					},
					'33%': {
						transform: 'translate(30px, -50px) scale(1.1)',
					},
					'66%': {
						transform: 'translate(-20px, 20px) scale(0.9)',
					},
					'100%': {
						transform: 'translate(0px, 0px) scale(1)',
					},
				},
				fadeInUp: {
					'0%': {
						opacity: '0',
						transform: 'translateY(30px)',
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)',
					},
				},
				float: {
					'0%, 100%': {
						transform: 'translateY(0px)',
					},
					'50%': {
						transform: 'translateY(-20px)',
					},
				},
				glow: {
					'0%': {
						boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
					},
					'100%': {
						boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)',
					},
				},
				slideInLeft: {
					'0%': {
						opacity: '0',
						transform: 'translateX(-100px)',
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)',
					},
				},
				slideInRight: {
					'0%': {
						opacity: '0',
						transform: 'translateX(100px)',
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)',
					},
				},
				zoomIn: {
					'0%': {
						opacity: '0',
						transform: 'scale(0.3)',
					},
					'50%': {
						opacity: '1',
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)',
					},
				},
				bounceIn: {
					'0%': {
						opacity: '0',
						transform: 'scale(0.3)',
					},
					'50%': {
						opacity: '1',
						transform: 'scale(1.05)',
					},
					'70%': {
						transform: 'scale(0.9)',
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)',
					},
				},
				scaleIn: {
					'0%': {
						opacity: '0',
						transform: 'scale(0)',
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)',
					},
				},
				rotateIn: {
					'0%': {
						opacity: '0',
						transform: 'rotate(-200deg)',
					},
					'100%': {
						opacity: '1',
						transform: 'rotate(0)',
					},
				},
				flipIn: {
					'0%': {
						opacity: '0',
						transform: 'perspective(400px) rotateY(90deg)',
					},
					'40%': {
						transform: 'perspective(400px) rotateY(-20deg)',
					},
					'60%': {
						transform: 'perspective(400px) rotateY(10deg)',
					},
					'80%': {
						transform: 'perspective(400px) rotateY(-5deg)',
					},
					'100%': {
						opacity: '1',
						transform: 'perspective(400px) rotateY(0deg)',
					},
				},
				slideUp: {
					'0%': {
						opacity: '0',
						transform: 'translateY(100px)',
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)',
					},
				},
				fadeIn: {
					'0%': {
						opacity: '0',
					},
					'100%': {
						opacity: '1',
					},
				},
				slideDown: {
					'0%': {
						opacity: '0',
						transform: 'translateY(-100px)',
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)',
					},
				},
				wiggle: {
					'0%, 100%': {
						transform: 'rotate(-3deg)',
					},
					'50%': {
						transform: 'rotate(3deg)',
					},
				},
				'gradient-x': {
					'0%, 100%': {
						'background-size': '200% 200%',
						'background-position': 'left center',
					},
					'50%': {
						'background-size': '200% 200%',
						'background-position': 'right center',
					},
				},
				'gradient-y': {
					'0%, 100%': {
						'background-size': '200% 200%',
						'background-position': 'center top',
					},
					'50%': {
						'background-size': '200% 200%',
						'background-position': 'center bottom',
					},
				},
				'gradient-xy': {
					'0%, 100%': {
						'background-size': '400% 400%',
						'background-position': 'left center',
					},
					'50%': {
						'background-size': '200% 200%',
						'background-position': 'right center',
					},
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'blob': 'blob 7s infinite',
				'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
				'float': 'float 6s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite alternate',
				'slide-in-left': 'slideInLeft 0.8s ease-out forwards',
				'slide-in-right': 'slideInRight 0.8s ease-out forwards',
				'zoom-in': 'zoomIn 0.6s ease-out forwards',
				'bounce-in': 'bounceIn 0.8s ease-out forwards',
				'scale-in': 'scaleIn 0.6s ease-out forwards',
				'rotate-in': 'rotateIn 0.8s ease-out forwards',
				'flip-in': 'flipIn 0.8s ease-out forwards',
				'slide-up': 'slideUp 0.6s ease-out forwards',
				'fade-in': 'fadeIn 0.8s ease-out forwards',
				'slide-down': 'slideDown 0.6s ease-out forwards',
				'wiggle': 'wiggle 1s ease-in-out infinite',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
				'gradient-x': 'gradient-x 15s ease infinite',
				'gradient-y': 'gradient-y 15s ease infinite',
				'gradient-xy': 'gradient-xy 15s ease infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
