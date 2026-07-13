export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role: string;
    role_libelle: string;
  };
}
