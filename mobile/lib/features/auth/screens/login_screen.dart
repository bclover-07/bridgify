import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String _selectedRole = 'student';

  final List<String> _roles = ['student', 'faculty', 'admin', 'recruiter'];

  void _demoLogin() {
    switch (_selectedRole) {
      case 'student':
        _emailController.text = 'arjun@mrdu.edu';
        _passwordController.text = 'test123';
        break;
      case 'faculty':
        _emailController.text = 'lakshmi.naidu@mrdu.edu';
        _passwordController.text = 'faculty123';
        break;
      case 'admin':
        _emailController.text = 'admin@mrdu.edu';
        _passwordController.text = 'admin123';
        break;
      case 'recruiter':
        _emailController.text = 'ravi@techspark.com';
        _passwordController.text = 'recruiter123';
        break;
    }
    _handleLogin();
  }

  void _handleLogin() async {
    final success = await ref.read(authProvider.notifier).login(
      _emailController.text, 
      _passwordController.text, 
      _selectedRole
    );
    
    if (success && mounted) {
      context.go('/$_selectedRole');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              // Language Switcher
              Align(
                alignment: Alignment.topRight,
                child: NeuButton(
                  text: context.locale.languageCode.toUpperCase(),
                  backgroundColor: NeuTheme.acid,
                  textColor: NeuTheme.ink,
                  onPressed: () {
                    final nextLocale = context.locale.languageCode == 'en' ? 'hi' : 'en';
                    context.setLocale(Locale(nextLocale));
                  },
                ),
              ),
              const SizedBox(height: 60),
              Text(
                'app_title'.tr(),
                style: const TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.w900,
                  color: NeuTheme.ink,
                  letterSpacing: -2,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                'Neu-Brutalist Mobile Experience',
                style: TextStyle(
                  fontSize: 16,
                  color: NeuTheme.ink,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              
              NeuCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'login'.tr(),
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: NeuTheme.ink,
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    // Role Selector
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _roles.map((role) {
                        final isSelected = _selectedRole == role;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedRole = role),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: isSelected ? NeuTheme.electric : Colors.white,
                              border: Border.all(color: NeuTheme.ink, width: 2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              role.tr(),
                              style: TextStyle(
                                color: isSelected ? Colors.white : NeuTheme.ink,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 24),

                    NeuInput(
                      hintText: 'email'.tr(),
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),
                    NeuInput(
                      hintText: 'password'.tr(),
                      controller: _passwordController,
                      obscureText: true,
                    ),
                    
                    if (authState.error != null) ...[
                      const SizedBox(height: 16),
                      Text(
                        authState.error!,
                        style: const TextStyle(color: NeuTheme.coral, fontWeight: FontWeight.bold),
                      ),
                    ],

                    const SizedBox(height: 32),
                    NeuButton(
                      text: authState.isLoading ? '...' : 'login'.tr(),
                      backgroundColor: NeuTheme.hotpink,
                      onPressed: authState.isLoading ? () {} : _handleLogin,
                    ),
                    const SizedBox(height: 16),
                    NeuButton(
                      text: 'demo_login'.tr(),
                      backgroundColor: NeuTheme.cyan,
                      textColor: NeuTheme.ink,
                      onPressed: _demoLogin,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
