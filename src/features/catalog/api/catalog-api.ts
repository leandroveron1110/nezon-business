import { CreateOrderFull } from "../types/order";
import { Address, AddressCreateDto } from "../types/address";
import {
  IMenu,
  IMenuProduct,
  IMenuSectionWithProducts,
  IOption,
  IOptionGroup,
  MenuCreate,
  MenuProductCreate,
  OptionCreate,
  OptionGroupCreate,
  SectionCreate,
} from "../types/catlog";
import { handleApiError } from "@/lib/handleApiError";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  ApiResult,
} from "@/lib/apiFetch";
import { IGlobalImage } from "@/types/global-image";

// -----------------------------
// CATALOG
// -----------------------------

export const fetchCatalogByBusinessID = async (
  businessId: string,
): Promise<ApiResult<IMenu[]>> => {
  try {
    const res = await apiGet<IMenu[]>(`/menus/business/all/${businessId}`);
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al obtener el catálogo del negocio");
  }
};

export const fetchMenuProducDetaillByProductId = async (
  productId: string,
): Promise<ApiResult<IMenuProduct>> => {
  try {
    const res = await apiGet<IMenuProduct>(
      `/menu-products/product/${productId}`,
    );
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al obtener el detalle del producto");
  }
};

export const fetchCreateOrder = async (
  payload: CreateOrderFull,
): Promise<unknown> => {
  try {
    const data = await apiPost("/orders/full", payload);
    return data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al crear la orden");
  }
};

export const fetchCreateAddress = async (
  payload: Address,
): Promise<ApiResult<AddressCreateDto>> => {
  try {
    const data = await apiPost<AddressCreateDto>("/address", payload);
    return data.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al crear la dirección");
  }
};

export const fetchUserAddresses = async (
  userId: string,
): Promise<ApiResult<AddressCreateDto[]>> => {
  try {
    const res = await apiGet<AddressCreateDto[]>(`/address/user/${userId}`);
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al obtener las direcciones del usuario");
  }
};

// -----------------------------
// MENUS
// -----------------------------

export const fetchMenuByBusinessId = async (
  businessId: string,
): Promise<ApiResult<IMenu[]>> => {
  try {
    const res = await apiGet<IMenu[]>(`menus/business/${businessId}`);
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al obtener los menús del negocio");
  }
};

export const createMenu = async (
  newMenu: MenuCreate,
): Promise<ApiResult<IMenu>> => {
  try {
    const res = await apiPost<IMenu>(`menus/`, newMenu);
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al crear el menú");
  }
};

export const updateMenu = async (
  menuId: string,
  data: Partial<MenuCreate>,
): Promise<ApiResult<IMenu>> => {
  try {
    const res = await apiPut<IMenu>(`menus/${menuId}`, data);
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al actualizar el menú");
  }
};

export const deleteMenu = async (menuId: string): Promise<void> => {
  try {
    await apiDelete(`menus/${menuId}`);
  } catch (error: unknown) {
    throw handleApiError(error, "Error al eliminar el menú");
  }
};

// -----------------------------
// SECTIONS
// -----------------------------

export const createSection = async (
  section: SectionCreate,
): Promise<ApiResult<IMenuSectionWithProducts>> => {
  try {
    const res = await apiPost<IMenuSectionWithProducts>(
      `menu/secciones`,
      section,
    );
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al crear la sección");
  }
};

export const updateSection = async (
  sectionId: string,
  data: Partial<SectionCreate>,
): Promise<ApiResult<IMenuSectionWithProducts>> => {
  try {
    const res = await apiPatch<IMenuSectionWithProducts>(
      `menu/secciones/${sectionId}`,
      data,
    );
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al actualizar la sección");
  }
};

export const deleteSection = async (sectionId: string): Promise<void> => {
  try {
    await apiDelete(`menu/secciones/${sectionId}`);
  } catch (error: unknown) {
    throw handleApiError(error, "Error al eliminar la sección");
  }
};

// -----------------------------
// MENU PRODUCTS
// -----------------------------

export const createMenuProduct = async (
  product: MenuProductCreate,
): Promise<ApiResult<IMenuProduct>> => {
  try {
    const res = await apiPost<IMenuProduct>(`menu-products/`, product);
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al crear el producto");
  }
};

export const updateMenuProduct = async (
  productId: string,
  data: Partial<MenuProductCreate>,
): Promise<ApiResult<IMenuProduct>> => {
  try {
    const res = await apiPatch<IMenuProduct>(
      `menu-products/${productId}`,
      data,
    );
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al actualizar el producto");
  }
};

export const deleteMenuProduct = async (productId: string): Promise<void> => {
  try {
    await apiDelete(`menu-products/${productId}`);
  } catch (error: unknown) {
    throw handleApiError(error, "Error al eliminar el producto");
  }
};

interface FetchImageGlobalParams {
  query?: string; // Hacemos el query opcional
  lastSyncTime?: string;
}

// El hook espera { items: T[], latestTimestamp: string }
interface FetchImageGlobalResponse {
  items: IGlobalImage[];
  latestTimestamp: string;
}

export const fetchImageGlobal = async ({
  query,
  lastSyncTime,
}: FetchImageGlobalParams): Promise<FetchImageGlobalResponse> => {
  try {
    // 1. Prepara los parámetros de consulta
    const params: Record<string, string | undefined> = {};
    if (query) params.query = query;
    if (lastSyncTime) params.lastSyncTime = lastSyncTime;

    const res = await apiGet<IGlobalImage[]>(`uploads/global`, {
      params,
    });

    if (!res.timestamp || !res.data) {
      throw new Error(
        "Respuesta de API con formato incorrecto para sincronización.",
      );
    }

    return {
      items: res.data, // Los items (IGlobalImage[])
      latestTimestamp: res.timestamp, // El timestamp del servidor (newSyncTime)
    };
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Error al buscar o sincronizar las imágenes globales",
    );
  }
};

export const uploadMenuProductImageGlobal = async (
  menuProductId: string,
  imageId: string,
) => {
  try {
    await apiPost(`menu-product-images/link`, {
      menuProductId,
      imageId,
    });
  } catch (error: unknown) {
    throw handleApiError(error, "Error al subir la imagen");
  }
};

export const uploadMenuProductImage = async (
  menuProductId: string,
  file: File,
): Promise<ApiResult<{ url: string }>> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiPost<{ url: string }>(
      `menu-product-images/upload?menuProductId=${menuProductId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al subir la imagen del producto");
  }
};

export const deleteMenuProductImage = async (menuProductId: string) => {
  try {
    await apiDelete(`menu-product-images?menuProductId=${menuProductId}`);
  } catch (error: unknown) {
    throw handleApiError(error, "Error al eliminar la imagen del producto");
  }
};

// -----------------------------
// OPTION GROUPS
// -----------------------------

export const createOptionGroup = async (
  group: OptionGroupCreate,
): Promise<ApiResult<IOptionGroup>> => {
  try {
    const res = await apiPost<IOptionGroup>(`option-groups/`, group);
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al crear el grupo de opciones");
  }
};

export const updateOptionGroup = async (
  groupId: string,
  data: Partial<OptionGroupCreate>,
): Promise<ApiResult<IOptionGroup>> => {
  try {
    const res = await apiPatch<IOptionGroup>(`option-groups/${groupId}`, data);
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al actualizar el grupo de opciones");
  }
};

export const deleteOptionGroup = async (groupId: string): Promise<void> => {
  try {
    await apiDelete(`option-groups/${groupId}`);
  } catch (error: unknown) {
    throw handleApiError(error, "Error al eliminar el grupo de opciones");
  }
};

// -----------------------------
// OPTIONS
// -----------------------------

export const createOption = async (
  option: OptionCreate,
): Promise<ApiResult<IOption>> => {
  try {
    const res = await apiPost<IOption>(`options/`, option);
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al crear la opción");
  }
};

export const updateOption = async (
  optionId: string,
  data: Partial<OptionCreate>,
): Promise<ApiResult<IOption>> => {
  try {
    const res = await apiPatch<IOption>(`options/${optionId}`, data);
    return res.data;
  } catch (error: unknown) {
    throw handleApiError(error, "Error al actualizar la opción");
  }
};

export const deleteOption = async (optionId: string): Promise<void> => {
  try {
    await apiDelete(`options/${optionId}`);
  } catch (error: unknown) {
    throw handleApiError(error, "Error al eliminar la opción");
  }
};

export const deleteManyOption = async (optionIds: string[]): Promise<void> => {
  try {
    await apiDelete(`options/multiple`, { data: { ids: optionIds } });
  } catch (error: unknown) {
    throw handleApiError(error, "Error al eliminar múltiples opciones");
  }
};
