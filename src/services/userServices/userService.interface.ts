export interface AuthRequestProps {
  email?: string;
  password?: string;
}

export interface UpdateUserRequestProps extends AuthRequestProps {
  id: string;
  name: string;
  admin?: boolean;
}
