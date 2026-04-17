import re

with open('components/navigation.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

state_hook = '''  const [isScrolled, setIsScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  const isHomePage = pathname === '/'
  const showPillNav = !isHomePage || isScrolled || isMenuOpen
'''
text = re.sub(r'(const pathname = usePathname\(\)\n)', r'\1\n' + state_hook, text)

header_replacement = '''<header
      className={ixed left-0 right-0 z-50 transition-all duration-500 ease-in-out }
    >
      <div
        className={max-w-7xl mx-auto transition-all duration-500 ease-in-out }
      >'''

text = re.sub(r'<header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">\s*<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">', header_replacement, text)

logo_color = '''<span className={	ext-xl font-black tracking-tight transition-colors duration-300 }>SinergiLaut</span>'''
text = re.sub(r'<span className="text-xl font-bold text-foreground">SinergiLaut</span>', logo_color, text)

nav_links_color = '''                  className={	ext-base font-semibold transition-all relative }'''
text = re.sub(r'className=\{	ext-base font-semibold transition-all relative \$\{\s*isActive\s*\?\s*"text-primary"\s*:\s*"text-muted-foreground hover:text-foreground"\s*\}\\}', nav_links_color, text)

auth_btns_replace = '''<Button 
                  variant="ghost" 
                  size="sm" 
                  className={ont-bold transition-all }
                  asChild
                >
                  <Link href="/login">Masuk</Link>
                </Button>'''
text = re.sub(r'<Button variant="ghost" size="sm" asChild>\s*<Link href="/login">Masuk</Link>\s*</Button>', auth_btns_replace, text)

user_text_replace = '''<span className={	ext-sm font-medium max-w-[100px] truncate }>'''
text = re.sub(r'<span className="text-sm font-medium max-w-\[100px\] truncate">', user_text_replace, text)
text = text.replace('<ChevronDown className="h-3 w-3 text-muted-foreground" />', '<ChevronDown className={h-3 w-3 } />')

text = text.replace('variant="ghost" size="sm" className="relative" aria-label="Notifikasi"', 'variant="ghost" size="sm" className={elative } aria-label="Notifikasi"')

menu_icon_replace = '''{isMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className={h-6 w-6 } />}'''
text = re.sub(r'\{isMenuOpen \? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />\}', menu_icon_replace, text)

# For Mobile menu background, we don't need to change text color since it opens on top, but the dropdown box itself uses standard background
# We can just leave mobile menu links as is because it opens inside a standard background menu card.

with open('components/navigation.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
