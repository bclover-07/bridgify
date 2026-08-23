import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  bool _isHoveringLogin = false;
  bool _isHoveringRegister = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );
    
    _slideAnimation = Tween<Offset>(begin: const Offset(0, 0.2), end: Offset.zero).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Widget _buildLanguageSwitcher(BuildContext context) {
    return Align(
      alignment: Alignment.topRight,
      child: PopupMenuButton<Locale>(
        initialValue: context.locale,
        onSelected: (Locale locale) {
          context.setLocale(locale);
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: NeuTheme.acid,
            border: Border.all(color: NeuTheme.ink, width: 2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.language, size: 18, color: NeuTheme.ink),
              const SizedBox(width: 8),
              Text(
                context.locale.languageCode.toUpperCase(),
                style: const TextStyle(fontWeight: FontWeight.bold, color: NeuTheme.ink),
              ),
            ],
          ),
        ),
        itemBuilder: (BuildContext context) => <PopupMenuEntry<Locale>>[
          const PopupMenuItem<Locale>(value: Locale('en'), child: Text('English (EN)')),
          const PopupMenuItem<Locale>(value: Locale('hi'), child: Text('हिंदी (HI)')),
          const PopupMenuItem<Locale>(value: Locale('mr'), child: Text('मराठी (MR)')),
          const PopupMenuItem<Locale>(value: Locale('te'), child: Text('తెలుగు (TE)')),
          const PopupMenuItem<Locale>(value: Locale('ta'), child: Text('தமிழ் (TA)')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeuTheme.paper,
      body: SafeArea(
        child: Stack(
          children: [
            // Background blur circles like the web app
            Positioned(
              top: -100,
              left: -100,
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  color: NeuTheme.electric.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Positioned(
              bottom: -100,
              right: -100,
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  color: NeuTheme.hotpink.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: SlideTransition(
                    position: _slideAnimation,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _buildLanguageSwitcher(context),
                        const SizedBox(height: 60),
                        const Icon(
                          Icons.hub_outlined,
                          size: 100,
                          color: NeuTheme.ink,
                        ),
                        const SizedBox(height: 24),
                        Text(
                          'app_title'.tr(),
                          style: const TextStyle(
                            fontSize: 56,
                            fontWeight: FontWeight.w900,
                            color: NeuTheme.ink,
                            letterSpacing: -2,
                            height: 1.1,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: NeuTheme.hotpink,
                            border: Border.all(color: NeuTheme.ink, width: 3),
                          ),
                          child: Text(
                            'empowering_future'.tr(),
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 64),
                        
                        // Animated Login Button
                        MouseRegion(
                          onEnter: (_) => setState(() => _isHoveringLogin = true),
                          onExit: (_) => setState(() => _isHoveringLogin = false),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            transform: Matrix4.translationValues(_isHoveringLogin ? 5 : 0, _isHoveringLogin ? -5 : 0, 0),
                            child: NeuButton(
                              text: 'login'.tr(),
                              backgroundColor: NeuTheme.electric,
                              textColor: Colors.white,
                              onPressed: () => context.push('/login'),
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        
                        // Animated Register Button
                        MouseRegion(
                          onEnter: (_) => setState(() => _isHoveringRegister = true),
                          onExit: (_) => setState(() => _isHoveringRegister = false),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            transform: Matrix4.translationValues(_isHoveringRegister ? 5 : 0, _isHoveringRegister ? -5 : 0, 0),
                            child: NeuButton(
                              text: 'register'.tr(),
                              backgroundColor: NeuTheme.sky,
                              textColor: NeuTheme.ink,
                              onPressed: () => context.push('/register'),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
