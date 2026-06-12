terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = "9a2a3713-c83d-47dc-ba5a-11ca0e6cdb9d"
  tenant_id       = "f0cac47b-e2b3-4e1b-a52f-487d2d996288"
}

resource "azurerm_resource_group" "dental_rg" {
  name     = "dental-app-resources"
  location = "austriaeast"
}

resource "azurerm_postgresql_flexible_server" "dental_db" {
  name                   = "dental-app-db-2026"
  resource_group_name    = azurerm_resource_group.dental_rg.name
  location               = "austriaeast"
  version                = "13"
  administrator_login    = "dentaladmin"
  administrator_password = "Password123456!"
  sku_name               = "B_Standard_B1ms"
  storage_mb             = 32768
}

resource "azurerm_kubernetes_cluster" "dental_aks" {
  name                = "dental-aks-cluster"
  location            = azurerm_resource_group.dental_rg.location
  resource_group_name = azurerm_resource_group.dental_rg.name
  dns_prefix          = "dental-aks"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_D2s_v3"
  }

  identity {
    type = "SystemAssigned"
  }
}