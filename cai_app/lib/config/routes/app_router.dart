import 'package:go_router/go_router.dart';
import 'package:cai_app/config/routes/route_names.dart';
import 'package:cai_app/features/radio/presentation/pages/radio_page.dart';
import 'package:flutter/material.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/radio', // Temporalmente para probar
  routes: [
    GoRoute(
      path: '/radio',
      name: 'radio',
      builder: (context, state) => const RadioPage(),
    ),
    GoRoute(
      path: '/',
      name: RouteNames.splash,
      builder: (context, state) => const Scaffold(
        body: Center(child: Text('Splash Screen')),
      ),
    ),
    GoRoute(
      path: '/login',
      name: RouteNames.login,
      builder: (context, state) => const Scaffold(
        body: Center(child: Text('Login Page')),
      ),
    ),
    GoRoute(
      path: '/dashboard',
      name: RouteNames.dashboard,
      builder: (context, state) => const Scaffold(
        body: Center(child: Text('Dashboard Page')),
      ),
    ),
  ],
);
