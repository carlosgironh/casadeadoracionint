import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:cai_app/config/routes/app_router.dart';
import 'package:cai_app/config/theme/app_theme.dart';
import 'package:cai_app/config/constants/app_constants.dart';
import 'package:cai_app/features/radio/presentation/bloc/radio_cubit.dart';

class CaiApp extends StatelessWidget {
  const CaiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<RadioCubit>(create: (context) => RadioCubit()),
      ],
      child: MaterialApp.router(
        title: AppConstants.appName,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system, // o ThemeMode.light
        routerConfig: appRouter,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

