"""
Paleta de colores del branding Lirios Eventos
Colores del logo: Dorado/Bronce, Blanco, Negro
"""
class ColoresBranding:
    """Paleta de colores consistente para toda la aplicación"""
    
    # Colores principales del logo
    FONDO_OSCURO = '#000000'  # Negro
    FONDO_MEDIO = '#1a1a1a'  # Negro ligeramente claro
    FONDO_CLARO = '#f5f5f5'  # Gris muy claro para fondos de contenido
    
    # Dorado/Bronce - Color principal del branding
    DORADO_PRINCIPAL = '#d4af37'  # Dorado principal del logo
    DORADO_MEDIO = '#c9a961'  # Bronce/dorado medio
    DORADO_OSCURO = '#b8860b'  # Dorado oscuro para hover
    DORADO_CLARO = '#f0d98e'  # Dorado claro para acentos
    
    # Blanco
    BLANCO = '#ffffff'  # Blanco del logo
    
    # Colores de texto
    TEXTO_CLARO = '#ffffff'
    TEXTO_OSCURO = '#1a1a1a'
    TEXTO_GRIS = '#757575'
    TEXTO_DORADO = '#d4af37'
    
    # Colores de entrada/formularios
    ENTRY_BG = '#f8f9fa'
    ENTRY_BORDER = '#e0e0e0'
    
    # Colores de botones
    BOTON_PRINCIPAL = DORADO_PRINCIPAL
    BOTON_HOVER = DORADO_MEDIO
    BOTON_ACTIVE = DORADO_OSCURO
    
    # Colores para tarjetas/frames
    CARD = BLANCO
    
    @staticmethod
    def obtener_paleta():
        """Retorna un diccionario con toda la paleta de colores"""
        return {
            'fondo_oscuro': ColoresBranding.FONDO_OSCURO,
            'fondo_medio': ColoresBranding.FONDO_MEDIO,
            'fondo_claro': ColoresBranding.FONDO_CLARO,
            'dorado_principal': ColoresBranding.DORADO_PRINCIPAL,
            'dorado_medio': ColoresBranding.DORADO_MEDIO,
            'dorado_oscuro': ColoresBranding.DORADO_OSCURO,
            'dorado_claro': ColoresBranding.DORADO_CLARO,
            'blanco': ColoresBranding.BLANCO,
            'texto_claro': ColoresBranding.TEXTO_CLARO,
            'texto_oscuro': ColoresBranding.TEXTO_OSCURO,
            'texto_gris': ColoresBranding.TEXTO_GRIS,
            'texto_dorado': ColoresBranding.TEXTO_DORADO,
            'entry_bg': ColoresBranding.ENTRY_BG,
            'entry_border': ColoresBranding.ENTRY_BORDER,
            'boton_principal': ColoresBranding.BOTON_PRINCIPAL,
            'boton_hover': ColoresBranding.BOTON_HOVER,
            'boton_active': ColoresBranding.BOTON_ACTIVE,
            'card': ColoresBranding.CARD
        }
