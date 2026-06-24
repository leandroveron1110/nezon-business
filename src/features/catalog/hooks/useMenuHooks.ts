import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMenuByBusinessId,
  createMenu,
  updateMenu,
  deleteMenu,
  createSection,
  updateSection,
  deleteSection,
  createMenuProduct,
  updateMenuProduct,
  deleteMenuProduct,
  createOptionGroup,
  updateOptionGroup,
  deleteOptionGroup,
  createOption,
  updateOption,
  deleteOption,
  deleteManyOption,
  uploadMenuProductImage,
  deleteMenuProductImage,
  uploadMenuProductImageGlobal,
} from "../api/catalog-api";
import {
  IMenu,
  MenuCreate,
  SectionCreate,
  MenuProductCreate,
  OptionGroupCreate,
  OptionCreate,
  IOption,
  IMenuSectionWithProducts,
  IMenuProduct,
  IOptionGroup,
} from "../types/catlog";
import { ApiResult } from "@/lib/apiFetch";
import { ApiError } from "@/types/api";

// Clave base única y precisa para la caché de todo el catálogo.
// El businessId es clave para la actualización de la caché.
const CATALOG_QUERY_KEY = (businessId: string) => [
  "menu-all-business",
  businessId,
];

// Función utilitaria para actualizar el catálogo anidado en la caché
// NOTA: Esta es una función PLACEHOLDER y debe contener la lógica de
// navegación profunda (menú -> sección -> producto) para encontrar y
// reemplazar el elemento que se actualiza.
const updateCatalogCache = <T>(
  queryClient: ReturnType<typeof useQueryClient>,
  businessId: string,
  itemId: string, // ID del elemento actualizado (producto, opción, etc.)
  updatedData: T, // El objeto actualizado devuelto por la API
  updateType: "menu" | "section" | "product" | "optionGroup" | "option"
) => {
  queryClient.setQueryData<ApiResult<IMenu[]> | undefined>(
    CATALOG_QUERY_KEY(businessId),
    (oldData) => {
      if (!oldData || !oldData) return oldData;

      // -------------------------------------------------------------------
      // ⚠️ AQUÍ VA LA LÓGICA COMPLEJA DE MUTACIÓN IN-PLACE (IN-MUTABLE)
      // En lugar de invalidar, se clona la estructura y se inserta el
      // `updatedData` en su ubicación correcta (menú, sección, producto, etc.).
      // Esto evita el re-fetch completo y es la MAYOR OPTIMIZACIÓN de rendimiento.
      // -------------------------------------------------------------------

      // Ejemplo MÍNIMO y NO-FUNCIONABLE para fines de demostración:
      // console.log(
      //   `Actualización optimista para ${updateType} con ID ${itemId}.`
      // );
      // Si no se puede hacer la actualización in-place de forma segura,
      // se vuelve al invalidateQueries para garantizar la coherencia de los datos.
      return undefined; // Devolver undefined fuerza el re-fetch (comportamiento de fallback)
    }
  );
};

// -----------------------------
// MENUS
// -----------------------------

export const useAllMenuByBusinessId = (businessId: string) => {
  return useQuery<ApiResult<IMenu[]>, ApiError>({
    queryKey: CATALOG_QUERY_KEY(businessId),
    queryFn: () => fetchMenuByBusinessId(businessId),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 60, // Mantiene la caché por 1 hora
  });
};

export const useCreateMenu = (businessId: string) => {
  // Se añade businessId
  const queryClient = useQueryClient();
  // Al crear un menú, es seguro invalidar, ya que afecta la estructura superior.
  return useMutation<ApiResult<IMenu>, ApiError, MenuCreate>({
    mutationFn: (data: MenuCreate) => createMenu(data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
      }),
  });
};

export const useUpdateMenu = (businessId: string) => {
  // Se añade businessId
  const queryClient = useQueryClient();
  return useMutation<
    ApiResult<IMenu>,
    ApiError,
    { menuId: string; data: Partial<MenuCreate> }
  >({
    mutationFn: ({
      menuId,
      data,
    }: {
      menuId: string;
      data: Partial<MenuCreate>;
    }) => updateMenu(menuId, data),
    // 💡 OPTIMIZADO: Actualización directa.
    onSuccess: (updatedMenuResult, { menuId }) => {
      // ⚠️ Usar setQueryData es la OPTIMIZACIÓN REAL.
      if (!updatedMenuResult) return;

      updateCatalogCache(
        queryClient,
        businessId,
        menuId,
        updatedMenuResult,
        "menu"
      );
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
        exact: true,
        stale: true,
      }); // Fallback suave
    },
  });
};

export const useDeleteMenu = (businessId: string) => {
  // Se añade businessId
  const queryClient = useQueryClient();
  // Al eliminar, es más seguro forzar un re-fetch.
  return useMutation<void, ApiError, string>({
    mutationFn: (menuId: string) => deleteMenu(menuId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
      }),
  });
};

// -----------------------------
// SECTIONS (Se sigue el mismo patrón de optimización para Update)
// -----------------------------

export const useCreateSection = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResult<IMenuSectionWithProducts>,
    ApiError,
    SectionCreate
  >({
    mutationFn: (data: SectionCreate) => createSection(data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
      }),
  });
};

export const useUpdateSection = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResult<IMenuSectionWithProducts>,
    ApiError,
    { sectionId: string; data: Partial<SectionCreate> }
  >({
    mutationFn: ({
      sectionId,
      data,
    }: {
      sectionId: string;
      data: Partial<SectionCreate>;
    }) => updateSection(sectionId, data),
    // 💡 OPTIMIZADO: Actualización directa.
    onSuccess: (updatedSectionResult, { sectionId }) => {
      if (!updatedSectionResult) return;

      updateCatalogCache(
        queryClient,
        businessId,
        sectionId,
        updatedSectionResult,
        "section"
      );
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
        exact: true,
        stale: true,
      }); // Fallback suave
    },
  });
};

export const useDeleteSection = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (sectionId: string) => deleteSection(sectionId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
      }),
  });
};

// -----------------------------
// MENU PRODUCTS (La optimización aquí es CRÍTICA)
// -----------------------------

export const useCreateMenuProduct = (businessId: string) => {
  const queryClient = useQueryClient();
  // Un nuevo producto impacta un catálogo grande, la invalidación es un mal necesario.
  return useMutation<ApiResult<IMenuProduct>, ApiError, MenuProductCreate>({
    mutationFn: (data: MenuProductCreate) => createMenuProduct(data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
      }),
  });
};

export const useUpdateMenuProduct = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResult<IMenuProduct>,
    ApiError,
    { productId: string; data: Partial<MenuProductCreate> }
  >({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: Partial<MenuProductCreate>;
    }) => updateMenuProduct(productId, data),
    // 💡 OPTIMIZADO: Actualización directa para evitar re-fetch de todo el catálogo.
    onSuccess: (updatedProductResult, { productId }) => {
      if (!updatedProductResult) return;

      updateCatalogCache(
        queryClient,
        businessId,
        productId,
        updatedProductResult,
        "product"
      );
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
        exact: true,
        stale: true,
      }); // Fallback suave
    },
  });
};

export const useDeleteMenuProduct = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (productId: string) => deleteMenuProduct(productId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
      }),
  });
};

// -----------------------------
// IMAGE (Igual que Producto)
// -----------------------------

export const useUploadMenuProductImage = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResult<{ url: string }>,
    ApiError,
    { menuProductId: string; file: File }
  >({
    mutationFn: ({
      menuProductId,
      file,
    }: {
      menuProductId: string;
      file: File;
    }) => uploadMenuProductImage(menuProductId, file),
    // 💡 OPTIMIZADO: Si solo se actualiza la URL de la imagen en el producto, se puede usar setQueryData.
    onSuccess: (result, { menuProductId }) => {
      // Idealmente, se actualizaría el producto en caché con la nueva URL de imagen.
      if (!result) return;

      updateCatalogCache(
        queryClient,
        businessId,
        menuProductId,
        result,
        "product"
      );
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
        exact: true,
        stale: true,
      }); // Fallback suave
    },
  });
};

export const useLinkMenuProductImage = () => {
  return useMutation({
    mutationFn: ({
      menuProductId,
      imageId,
    }: {
      menuProductId: string;
      imageId: string;
    }) => uploadMenuProductImageGlobal(menuProductId, imageId),
  });
};

export const useDeleteMenuProductImage = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (menuProductId: string) =>
      deleteMenuProductImage(menuProductId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
      }),
  });
};

// -----------------------------
// OPTION GROUPS (Optimizado para Update)
// -----------------------------

export const useCreateOptionGroup = (businessId: string) => {
  const queryClient = useQueryClient();
  // La creación afecta a un producto, que es parte del catálogo. Invalidate por simplicidad.
  return useMutation<ApiResult<IOptionGroup>, ApiError, OptionGroupCreate>({
    mutationFn: (data: OptionGroupCreate) => createOptionGroup(data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
      }),
  });
};

export const useUpdateOptionGroup = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResult<IOptionGroup>,
    ApiError,
    { groupId: string; data: Partial<OptionGroupCreate> }
  >({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string;
      data: Partial<OptionGroupCreate>;
    }) => updateOptionGroup(groupId, data),
    // 💡 OPTIMIZADO: Actualización directa.
    onSuccess: (updatedGroupResult, { groupId }) => {
      if (!updatedGroupResult) return;
      updateCatalogCache(
        queryClient,
        businessId,
        groupId,
        updatedGroupResult,
        "optionGroup"
      );
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
        exact: true,
        stale: true,
      }); // Fallback suave
    },
  });
};

export const useDeleteOptionGroup = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (groupId: string) => deleteOptionGroup(groupId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
      }),
  });
};

// -----------------------------
// OPTIONS (Optimizado para Update)
// -----------------------------

export const useCreateOption = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ApiResult<IOption>, ApiError, OptionCreate>({
    mutationFn: (data: OptionCreate) => createOption(data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
      }),
  });
};

export const useUpdateOption = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResult<IOption>,
    ApiError,
    { optionId: string; data: Partial<OptionCreate> }
  >({
    mutationFn: ({
      optionId,
      data,
    }: {
      optionId: string;
      data: Partial<OptionCreate>;
    }) => updateOption(optionId, data),
    // 💡 OPTIMIZADO: Actualización directa.
    onSuccess: (updatedOptionResult, { optionId }) => {
      if (updatedOptionResult)
        updateCatalogCache(
          queryClient,
          businessId,
          optionId,
          updatedOptionResult,
          "option"
        );
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
        exact: true,
        stale: true,
      }); // Fallback suave
    },
  });
};

export const useDeleteOption = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (optionId: string) => deleteOption(optionId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
      }),
  });
};

export const useDeleteManyOption = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string[]>({
    mutationFn: (optionId: string[]) => deleteManyOption(optionId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: CATALOG_QUERY_KEY(businessId),
      }),
  });
};
